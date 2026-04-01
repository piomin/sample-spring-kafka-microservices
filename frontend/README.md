# FE Main

## Genel Bakış

**FE Main**, sistemin ana giriş uygulamasıdır.
Kullanıcıların sisteme giriş yapmasını sağlar ve platform içerisindeki diğer uygulamalara yönlendirme ve erişim yönetimini gerçekleştirir.

Bu proje, kullanıcıların operasyonel modüllere veya diğer projelere erişebildiği **merkezi bir giriş noktası (gateway arayüzü)** olarak görev yapar.

## Sorumluluklar

Bu uygulama aşağıdaki işlemlerden sorumludur:

- Kullanıcı giriş işlemleri (login)
- Şifre sıfırlama süreçleri
- Kullanıcı aktivasyonu
- Kullanıcıları sistem içerisindeki diğer uygulamalara yönlendirme
- Operasyonel işlemler için merkezi bir erişim noktası sağlama

## Kapsam Dışı

Aşağıdaki kullanıcı yönetimi işlemleri bu proje kapsamında değildir:

- Kullanıcı oluşturma, güncelleme ve silme (CRUD)
- Rol ve yetki atamaları
- Kullanıcı yönetimi süreçleri

Bu işlemler **User Management** adlı ayrı bir uygulama üzerinden gerçekleştirilmektedir.

## İlgili Projeler

- **User Management**
  Kullanıcı yönetimi, rol atama ve yetki yönetimi işlemlerinin yapıldığı uygulamadır.

## Kullanılan Teknolojiler

- React
- TypeScript
- Webpack
- TailwindCSS
- i18next

## Geliştirme

Bağımlılıkları yüklemek için:

```bash
npm install
```

Geliştirme ortamını başlatmak için:

```bash
npm start
```

Projeyi build almak için:

```bash
npm run build
```

Production build’i lokal olarak test etmek için:

```bash
npm run build:preview
```

## Amaç

Bu projenin amacı, kullanıcılar için **sisteme merkezi bir giriş noktası sağlamak** ve platform içerisindeki diğer uygulamalara **tutarlı ve yönetilebilir bir erişim katmanı** oluşturmaktır.
