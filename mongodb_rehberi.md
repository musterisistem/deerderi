# MongoDB Veritabanı Kurulum Rehberi

Web sitenizin verilerini (üyelikler, siparişler) kalıcı olarak saklamak için **MongoDB Atlas** üzerinde ücretsiz bir veritabanı oluşturacağız. Adım adım yapalım:

## 1. Hesap Oluşturma
1. [mongodb.com/try](https://www.mongodb.com/try) adresine gidin.
2. **"Sign Up"** veya Google ile giriş yaparak ücretsiz hesap oluşturun.
3. Giriş yaptıktan sonra bir anket çıkarsa geçebilirsiniz.

## 2. Veritabanı (Cluster) Oluşturma
1. Karşınıza paket seçenekleri gelecek. **"M0 FREE"** (Ücretsiz) olanı seçin.
2. **Provider:** AWS (seçili kalsın).
3. **Region:** Frankfurt (eu-central-1) seçmeniz hız için idealdir (veya size yakın herhangi biri).
4. Alt kısımdaki **"Create"** butonuna basın. (Oluşturma 1-2 dakika sürebilir).

## 3. Kullanıcı Ayarları (Önemli!)
Size *"Security Quickstart"* ekranı gelecek:
1. **Username:** `admin` (veya istediğiniz bir isim).
2. **Password:** Güçlü bir şifre belirleyin ve **bunu bir yere not edin**.
3. **"Create User"** butonuna basın.

## 4. IP İzni (Vercel İçin Gerekli)
Aynı ekranda (veya sol menüden "Network Access"):
1. **"My Local Environment"** yerine **"Cloud Environment"**ı göreceksiniz.
2. Erişim listesine (IP Access List) **`0.0.0.0/0`** eklememiz lazım.
   - Veya pratik olarak: **"Allow Access from Anywhere"** butonuna tıklayın.
   - IP Address kutusunda `0.0.0.0/0` yazdığından emin olun.
   - **"Add Entry"** diyerek kaydedin.
   *(Bu ayar, Vercel sunucularının veritabanına bağlanabilmesini sağlar)*.

## 5. Bağlantı Kodunu Alma (Connection String)
1. Sol menüden **"Database"** sekmesine tıklayın.
2. Cluster isminin yanındaki **"Connect"** butonuna basın.
3. Açılan pencerede **"Drivers"** seçeneğine tıklayın.
4. **Driver:** Node.js, **Version:** 5.5 or later (farketmez).
5. Alt kısımda **"Add your connection string..."** başlığı altındaki kodu kopyalayın.

Şuna benzer bir kod olacak:
`mongodb+srv://admin:<db_password>@cluster0.abcde.mongodb.net/?retryWrites=true&w=majority`

## Son Adım
Kopyaladığınız bu kodu bana gönderin. Gönderirken `<db_password>` yazan yeri, 3. adımda belirlediğiniz **gerçek şifrenizle** değiştirmeyi unutmayın!

Örnek bana göndereceğiniz hali:
`mongodb+srv://admin:BenimSifrem123@cluster0.abcde.mongodb.net/?retryWrites=true&w=majority`
