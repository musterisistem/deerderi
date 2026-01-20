# Siteyi Yayına Alma & GitHub/Vercel Kurulum Rehberi

Projeniz Vercel altyapısına uygun hale getirildi. API fonksiyonları (mail gönderme vb.) **Serverless** mimarisine dönüştürüldü ve gerekli ayar dosyaları (`vercel.json`, `api/send-email.js`, `lib/templates.js`, `.gitignore`) oluşturuldu.

Aşağıdaki adımları takip ederek sitenizi yayınlayabilirsiniz.

## Adım 1: GitHub'a Yükleme
Bilgisayarınızda `git` komut satırı aracı bulunamadı. Bu yüzden GitHub Desktop uygulamasını kullanmanızı öneririm.

1. **GitHub Desktop İndirin:** [desktop.github.com](https://desktop.github.com/) adresinden indirip kurun.
2. **Giriş Yapın:** Uygulamayı açıp GitHub hesabınızla giriş yapın.
3. **Projeyi Ekleyin:**
   - `File` > `Add Local Repository` menüsüne tıklayın.
   - Proje klasörünü seçin: `I:\ANTIGRAVITY\PROJELER\DEER_DERI`
   - *"This directory does not appear to be a Git repository"* uyarısı alırsanız **"Create a Repository"** linkine tıklayın.
   - İsim verin (örn: `deer-deri-ecommerce`) ve **Create Repository** butonuna basın.
4. **Yayınlayın:**
   - Üstteki **"Publish repository"** butonuna tıklayın.
   - "Keep this code private" seçeneğini kaldırabilirsiniz (veya özel kalmasını istiyorsanız açık tutun).
   - **Publish Repository** butonuna basarak kodları GitHub'a gönderin.

## Adım 2: Vercel'e Bağlama
1. [Vercel.com](https://vercel.com) adresine gidin ve giriş yapın.
2. Dashboard'da **"Add New..."** > **"Project"** butonuna tıklayın.
3. **"Import Git Repository"** bölümünde GitHub hesabınızı seçin.
4. Az önce yüklediğiniz `deer-deri-ecommerce` projesini listede bulup **Import** butonuna tıklayın.

## Adım 3: Ayarlar ve Deploy
Proje konfigürasyon ekranında:

1. **Framework Preset:** `Other` olarak kalabilir (Vercel otomatik algılayacaktır).
2. **Environment Variables** (Önemli!):
   Mail sisteminin çalışması için API anahtarını eklemelisiniz.
   - **Environment Variables** sekmesini açın.
   - **Key:** `RESEND_API_KEY`
   - **Value:** (Bilgisayarınızdaki `.env` dosyasında yazan `re_...` ile başlayan anahtarı yapıştırın)
   - **Add** butonuna basın.

3. **Deploy** butonuna tıklayın.

## Notlar
- **Resim Yükleme:** Vercel üzerinde disk alanına dosya yüklenemez (`/api/upload` çalışmaz). Bu özellik için ileride harici bir depolama servisi (AWS S3 vb.) bağlamamız gerekecek.
- **Veritabanı:** Site yayınlandığında şu anki gibi tarayıcı hafızasını kullanmaya devam edecek. **Site yayına girdikten sonra bana haber verin, MongoDB kurulumuna geçelim.**

Başarılar! 🚀
