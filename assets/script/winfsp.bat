echo OFF

NET SESSION >nul 2>&1

IF %ERRORLEVEL% EQU 0 (

   choco install winfsp -y

   echo INSTALL_SUCCESS

   EXIT 0

) ELSE (
   echo %ERRORLEVEL% ERROR_NEED_ADMINISTRATOR_PRIVILEGES

   EXIT %ERRORLEVEL%
)