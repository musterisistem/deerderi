$port = 8080
$root = $PSScriptRoot

Write-Host "DEER DERI Web Sunucusu Baslatiliyor..." -ForegroundColor Cyan
Write-Host "Klasor: $root"
Write-Host "Adres: http://localhost:$port/"
Write-Host "Kapatmak icin pencereyi kapatin."

$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://localhost:$port/")
$listener.Start()

while ($listener.IsListening) {
    $context = $listener.GetContext()
    $request = $context.Request
    $response = $context.Response

    $path = $root + $request.Url.LocalPath
    if ($request.Url.LocalPath -eq "/") {
        $path = "$root\index.html"
    }

    if (Test-Path $path -PathType Leaf) {
        try {
            $content = [System.IO.File]::ReadAllBytes($path)
            $response.ContentLength64 = $content.Length
            
            # Simple content type mapping
            $extension = [System.IO.Path]::GetExtension($path).ToLower()
            switch ($extension) {
                ".html" { $response.ContentType = "text/html; charset=utf-8" }
                ".css"  { $response.ContentType = "text/css" }
                ".js"   { $response.ContentType = "application/javascript" }
                ".png"  { $response.ContentType = "image/png" }
                ".jpg"  { $response.ContentType = "image/jpeg" }
                ".jpeg" { $response.ContentType = "image/jpeg" }
                default { $response.ContentType = "application/octet-stream" }
            }
            
            $response.OutputStream.Write($content, 0, $content.Length)
        }
        catch {
            $response.StatusCode = 500
        }
    }
    else {
        $response.StatusCode = 404
    }

    $response.Close()
}
