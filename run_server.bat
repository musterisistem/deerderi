@echo off
echo DEER DERI Web Sunucusu Baslatiliyor...
echo.

REM Check common Node.js paths
IF EXIST "C:\Program Files\nodejs\node.exe" (
    echo Node.js bulundu: C:\Program Files\nodejs\node.exe
    "C:\Program Files\nodejs\node.exe" server.js
) ELSE IF EXIST "C:\Program Files (x86)\nodejs\node.exe" (
    echo Node.js bulundu (x86): C:\Program Files (x86)\nodejs\node.exe
    "C:\Program Files (x86)\nodejs\node.exe" server.js
) ELSE (
    REM Check if node is in PATH (even if my shell couldn't see it)
    node --version >nul 2>&1
    IF %ERRORLEVEL% EQU 0 (
        echo Node.js PATH uzerinde bulundu.
        node server.js
    ) ELSE (
        echo HATA: Node.js bulunamadi!
        echo Lutfen Node.js'in kurulu oldugundan emin olun.
        echo Eger kuruluysa, lutfen 'node.exe' yolunu bu dosyaya ekleyin.
        echo.
        pause
    )
)
