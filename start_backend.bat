@echo off
cd /d "c:\xampp\htdocs\projex\projex_backend"
echo Démarrage du backend PROJEX...
echo Backend accessible sur: http://localhost:8000
echo Appuyez sur Ctrl+C pour arrêter
echo.
c:\xampp\php\php.exe -S localhost:8000 -t public
pause
