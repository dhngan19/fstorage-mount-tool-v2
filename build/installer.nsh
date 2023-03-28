!ifndef PSEXEC_INCLUDED
!define PSEXEC_INCLUDED

!macro PowerShellExecMacro PSCommand
  InitPluginsDir
  ;Save command in a temp file
  Push $R1
  FileOpen $R1 $PLUGINSDIR\tempfile.ps1 w
  FileWrite $R1 "${PSCommand}"
  FileClose $R1
  Pop $R1

  !insertmacro PowerShellExecFileMacro "$PLUGINSDIR\tempfile.ps1"
!macroend

!macro PowerShellExecLogMacro PSCommand
  InitPluginsDir
  ;Save command in a temp file
  Push $R1
  FileOpen $R1 $PLUGINSDIR\tempfile.ps1 w
  FileWrite $R1 "${PSCommand}"
  FileClose $R1
  Pop $R1

  !insertmacro PowerShellExecFileLogMacro "$PLUGINSDIR\tempfile.ps1"
!macroend

!macro PowerShellExecFileMacro PSFile
  !define PSExecID ${__LINE__}
  Push $R0

  nsExec::ExecToStack 'powershell -inputformat none -ExecutionPolicy RemoteSigned -File "${PSFile}"  '

  Pop $R0 ;return value is first on stack
  ;script output is second on stack, leave on top of it
  IntCmp $R0 0 finish_${PSExecID}
  SetErrorLevel 2

finish_${PSExecID}:
  Exch ;now $R0 on top of stack, followed by script output
  Pop $R0
  !undef PSExecID
!macroend

!macro PowerShellExecFileLogMacro PSFile
  !define PSExecID ${__LINE__}
  Push $R0

  nsExec::ExecToLog 'powershell -inputformat none -ExecutionPolicy RemoteSigned -File "${PSFile}"  '
  Pop $R0 ;return value is on stack
  IntCmp $R0 0 finish_${PSExecID}
  SetErrorLevel 2

finish_${PSExecID}:
  Pop $R0
  !undef PSExecID
!macroend

!define PowerShellExec `!insertmacro PowerShellExecMacro`
!define PowerShellExecLog `!insertmacro PowerShellExecLogMacro`
!define PowerShellExecFile `!insertmacro PowerShellExecFileMacro`
!define PowerShellExecFileLog `!insertmacro PowerShellExecFileLogMacro`

!endif

!macro customInit
  nsExec::Exec "ping -n 1 www.google.com"
  Pop $0

  DetailPrint "$0"
  StrCmp $0 "0" connected
    MessageBox MB_OK|MB_ICONSTOP "Cannot connect to internet."
    Quit

  connected:
!macroend

!macro customInstall

  SetDetailsView show

  ExpandEnvStrings $0 "%SystemRoot%"

  nsExec::ExecToLog '"$0\System32\WindowsPowerShell\v1.0\powershell.exe" -NoProfile -InputFormat None -ExecutionPolicy Bypass -Command "[System.Net.ServicePointManager]::SecurityProtocol = 3072; iex ((New-Object System.Net.WebClient).DownloadString($\'https://chocolatey.org/install.ps1$\'))"'
  Pop $0

  ${If} $0 == "error"
    ; try running powershell in path, just in case ...
    nsExec::ExecToLog '"powershell.exe" -NoProfile -InputFormat None -ExecutionPolicy Bypass -Command "[System.Net.ServicePointManager]::SecurityProtocol = 3072; iex ((New-Object System.Net.WebClient).DownloadString($\'https://chocolatey.org/install.ps1$\'))"'
    Pop $0

    ${If} $0 == "error"
      DetailPrint "ERROR: Powershell is not installed!"
      DetailPrint "Powershell is a Microsoft product that normally comes pre-installed"
      DetailPrint "on Windows Vista, 7,8, 10+. It's installer can be found somewhere on"
      DetailPrint "the web."
      Abort
    ${EndIf}
  ${EndIf}

  ${If} $0 = 0
    ; Check if the path entry already exists and write result to $0
    nsExec::Exec 'echo %PATH% | find "%ALLUSERSPROFILE%\chocolatey\bin"'
    Pop $0   ; gets result code

    ${If} $0 <> 0
      DetailPrint "Adding Chocolatey to PATH..."
      nsExec::Exec 'set PATH=%PATH%;%ALLUSERSPROFILE%\chocolatey\bin'
      DetailPrint "IMPORTANT: You will need to restart any running cmd shells for the"
      DetailPrint "Chocolatey path to become effective!"
    ${EndIf}
  ${EndIf}

  Sleep 5000

!macroend


!macro customUnInstall
  SetDetailsView show

  SetRegView 32
  DeleteRegKey HKCU Software\Classes\CLSID\{5f7ad500-216c-415d-aa2b-300d652aa3f8}
  DeleteRegKey HKCU Software\Classes\Wow6432Node\CLSID\{5f7ad500-216c-415d-aa2b-300d652aa3f8}
  DeleteRegKey HKCU Software\Classes\CLSID\{5f7ad500-216c-415d-aa2b-300d652aa3f9}
  DeleteRegKey HKCU Software\Classes\Wow6432Node\CLSID\{5f7ad500-216c-415d-aa2b-300d652aa3f9}
  DeleteRegKey HKCU Software\Microsoft\Windows\CurrentVersion\Explorer\Desktop\NameSpace\{5f7ad500-216c-415d-aa2b-300d652aa3f9}
  DeleteRegValue HKCU Software\Microsoft\Windows\CurrentVersion\Explorer\HideDesktopIcons\NewStartPanel "{5f7ad500-216c-415d-aa2b-300d652aa3f9}"
  DeleteRegValue HKCU Software\Microsoft\Windows\CurrentVersion\Run "electron.app.Fstorage mount tool"
  !include x64.nsh
  ${If} ${RunningX64}
    SetRegView 64
    DeleteRegKey HKCU Software\Classes\CLSID\{5f7ad500-216c-415d-aa2b-300d652aa3f8}
    DeleteRegKey HKCU Software\Classes\Wow6432Node\CLSID\{5f7ad500-216c-415d-aa2b-300d652aa3f8}
    DeleteRegKey HKCU Software\Classes\CLSID\{5f7ad500-216c-415d-aa2b-300d652aa3f9}
    DeleteRegKey HKCU Software\Classes\Wow6432Node\CLSID\{5f7ad500-216c-415d-aa2b-300d652aa3f9}
    DeleteRegKey HKCU Software\Microsoft\Windows\CurrentVersion\Explorer\Desktop\NameSpace\{5f7ad500-216c-415d-aa2b-300d652aa3f9}
    DeleteRegValue HKCU Software\Microsoft\Windows\CurrentVersion\Explorer\HideDesktopIcons\NewStartPanel "{5f7ad500-216c-415d-aa2b-300d652aa3f9}"
    DeleteRegValue HKCU Software\Microsoft\Windows\CurrentVersion\Run "electron.app.Fstorage mount tool"
  ${EndIf}
  SetRegView Default

  SetShellVarContext current

  DetailPrint AppData=$APPDATA ; C:\Users\%username%\AppData\Roaming

  IfFileExists "$APPDATA\rclone\rclone.conf" DeleteThatFile
  DeleteThatFile:
    Delete "$APPDATA\rclone\rclone.conf"

  !insertmacro PowerShellExecMacro "taskkill /im rclone.exe /t /f"
  !insertmacro PowerShellExecMacro "schtasks /delete /tn 'fstorage-mount-tool' /f"

  RMDir /R "$INSTDIR"

  SetShellVarContext all

  DetailPrint AppData=$APPDATA

  RMDir /R "$APPDATA\chocolatey"

  ; !insertmacro PowerShellExecMacro "if ($env:ChocolateyToolsLocation -and (Test-Path $env:ChocolateyToolsLocation)) {Remove-Item -Path $env:ChocolateyToolsLocation -WhatIf -Recurse -Force}"
  ; !insertmacro PowerShellExecMacro "foreach ($scope in 'User', 'Machine') {[Environment]::SetEnvironmentVariable('ChocolateyToolsLocation', [string]::Empty, $scope)}"

  DetailPrint "$INSTDIR"

  Sleep 5000
!macroend
