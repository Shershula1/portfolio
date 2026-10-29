# Портфолио Дани Ретивых

Карточки проектов: снимок, название и дата. Клик открывает сам проект.

- **Неосвещаемая комната** — [shershula1.github.io/penrose-rays](https://shershula1.github.io/penrose-rays/).
- **Четырёхмерный куб** — [shershula1.github.io/tesseract](https://shershula1.github.io/tesseract/).
- **Evernote** — заметки в браузере. Вход и записи остаются на этом устройстве.

Раздел «Грамоты» хранит загруженные документы в браузере.

## Запуск

```bash
npm install
npm run dev -- --hostname 0.0.0.0 --port 4317
```

Откройте [http://127.0.0.1:4317](http://127.0.0.1:4317).

Остановить сервер: `Ctrl+C`.

Статическая сборка для GitHub Pages попадает в папку `out`:

```bash
PAGES_BASE_PATH=/portfolio npm run build
```

Публичный адрес после включения Pages у репозитория с именем `portfolio`: [https://shershula1.github.io/portfolio/](https://shershula1.github.io/portfolio/). Локально, без этого префикса, достаточно `npm run dev`.

Проверка дат грамот и путей к файлам:

```bash
npx tsx --test src/lib/public-path.test.ts src/lib/certificates.test.ts src/lib/penrose.test.ts
```
