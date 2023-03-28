echo OFF

NET SESSION >nul 2>&1

IF %ERRORLEVEL% EQU 0 (
   powershell -NoProfile -InputFormat None -ExecutionPolicy Bypass -Command "[System.Net.ServicePointManager]::SecurityProtocol = 3072; iex ((New-Object System.Net.WebClient).DownloadString('https://chocolatey.org/install.ps1'))" && SET "PATH=%PATH%;%ALLUSERSPROFILE%\chocolatey\bin"

   choco feature enable -n=allowGlobalConfirmation

   echo INSTALL_SUCCESS

   EXIT 0

) ELSE (   
   echo %ERRORLEVEL% ERROR_NEED_ADMINISTRATOR_PRIVILEGES

   EXIT %ERRORLEVEL%
)