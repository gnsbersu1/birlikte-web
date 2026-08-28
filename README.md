# Birlikte

## Mobil uyumlu web sürümü

Bu depo, Birlikte uygulamasının mobil tarayıcılar için hazırlanmış Expo Router web sürümüdür. Ana React Native projesinden bağımsız olarak Render üzerinde statik site şeklinde yayınlanır.

Yerel kontroller:

```bash
npm ci
npm run typecheck
npx expo-doctor
npm run build:web
```

Render ayarları `render.yaml` dosyasında tanımlıdır. Üretim çıktısı `dist` klasörüne oluşturulur ve bu klasör Git tarafından takip edilmez.

Birlikte, Almanya'da yaşayan yaşlıların akıllı telefon kullanımını güvenli ve anlaşılır biçimde öğrenmesine yardımcı olmak için geliştirilen Türkçe-Almanca bir React Native mobil uygulamasıdır.

Uygulama büyük yazılar, geniş dokunma alanları, yüksek kontrast, sade navigasyon ve kritik işlemlerden önce onay pencereleri kullanır.

## Mevcut özellikler

- İlk açılışta Türkçe veya Almanca dil seçimi
- Uygulama içinden daha sonra dil değiştirme
- Dokunma, kaydırma ve basılı tutma alıştırmaları
- Gerçek mesaj göndermeyen güvenli mesaj yazma alıştırması
- Yakın ekleme, cihazda saklama, arama ve mesaj uygulamasını açma
- Kaydedilmiş bütün yakınları onayla kalıcı olarak silme
- Almanya için 112, 110 ve 116117 yardım numaraları
- Telefon ve mesaj uygulaması açılmadan önce kullanıcı onayı
- iOS ve Android dinamik yazı boyutlarına uyumlu kaydırılabilir ekranlar

## Mevcut ekranlar

- Ana sayfa
- Telefonu Öğren / Teknoloji yardımı
- Yakınlarım
- Acil Yardım
- Dil / Sprache

## Henüz tamamlanmamış özellikler

Aşağıdaki özellikler mevcut sürümde tamamlanmış özellik olarak sunulmaz:

- Tek bir yakını düzenleme veya silme
- Yakınlar listesinde arama ve filtreleme
- Sesli anlatım
- Gerçek bir gönüllüye yardım talebi gönderme
- Şüpheli mesajları tanımaya yönelik etkileşimli ders
- Ders ilerlemesini uygulama kapatıldıktan sonra koruma

“Yardım talebi” ve “Şüpheli mesaj” bölümleri şu anda yalnızca demo/gelecek özellik bilgilendirmesidir.

## Teknolojiler

- React Native 0.81
- Expo SDK 54
- React 19
- TypeScript
- Expo Router
- React Context
- AsyncStorage
- React Native Animated ve PanResponder
- React Native Linking

## Veri ve gizlilik

Uygulama kullanıcı hesabı veya uzak sunucu kullanmaz. Eklenen yakınların adı, yakınlık bilgisi ve telefon numarası yalnızca kullanıcının cihazında `@birlikte/relatives` AsyncStorage anahtarı altında saklanır.

AsyncStorage şifrelenmiş bir kasa değildir. Bu nedenle yakın bilgileri cihazda şifrelenmeden tutulur ve hassas parola, kimlik belgesi veya ödeme bilgisi saklamak için kullanılmamalıdır.

Kullanıcı, Yakınlarım ekranındaki **Tüm yakınlarımı sil** seçeneğiyle kayıtlı yakın verilerini onay verdikten sonra cihazdan silebilir. Dil tercihi ayrı `@birlikte/language` anahtarında tutulur ve yakın verilerini silme işleminden etkilenmez.

Uygulama yakın bilgilerini bir sunucuya göndermez. Arama ve mesaj düğmeleri, kullanıcı onayından sonra cihazın telefon veya mesaj uygulamasını açar; uygulama kendi başına arama yapmaz veya mesaj göndermez.

## Kurulum

Gereksinimler:

- Node.js ve npm
- Android veya iOS için Expo Go ya da uygun bir emülatör

```bash
npm install
npm start
```

Platform komutları:

```bash
npm run android
npm run ios
```

> iOS simülatörü macOS gerektirir. Fiziksel iOS cihazında Expo Go kullanılabilir.

## Kalite kontrolleri

```bash
npm run typecheck
npx expo-doctor
```

## Proje yapısı

```text
app/          Expo Router ekranları ve sekme navigasyonu
components/   Ortak arayüz ve alıştırma bileşenleri
constants/    Renk, boşluk ve tema değerleri
contexts/     Dil context'i ve dil tercihi yönetimi
i18n/         Türkçe-Almanca çeviri sözlükleri
utils/        Erişilebilir düzen ve telefon/SMS yardımcıları
```

## CV için doğru kapsam

Bu proje; React Native ve Expo ile mobil geliştirme, TypeScript, çoklu dil desteği, erişilebilir arayüz tasarımı, AsyncStorage ile yerel veri saklama, gesture alıştırmaları ve cihazın telefon/SMS uygulamalarıyla güvenli entegrasyon kazanımlarını gösterir.

Henüz tamamlanmamış özellikler CV'de tamamlanmış olarak belirtilmemelidir.

## Lisans

Bu proje [MIT Lisansı](LICENSE) ile lisanslanmıştır.
