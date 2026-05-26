# Тоғызқұмалақ

Настольная игра Великой степи (Vite + React).

## Локально

```bash
npm install
npm run dev
```

## Деплой на Render

### Вариант A (рекомендуется)

В **Settings → Build & Deploy** у Static Site:

| Поле | Значение |
|------|----------|
| **Root Directory** | *(пусто)* |
| **Build Command** | `npm install && npm run build` |
| **Publish Directory** | `dist` |

### Вариант B (если Root Directory уже стоит `src`)

Ничего менять не нужно — в репозитории есть `src/package.json`, который собирает проект из корня и кладёт результат в `src/dist`.

| Поле | Значение |
|------|----------|
| **Root Directory** | `src` |
| **Build Command** | `npm install && npm run build` |
| **Publish Directory** | `dist` |

После push в `main` Render пересоберёт сайт автоматически.

## Обновление GitHub

```bash
git add .
git commit -m "Исправить сборку Render (src shim + render.yaml)"
git push origin main
```
