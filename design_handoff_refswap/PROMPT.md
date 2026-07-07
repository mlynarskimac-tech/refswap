# Prompt do wklejenia w Claude Code

Skopiuj wszystko poniżej (linia odcięcia) do Claude Code w VS Code. Najpierw upewnij się, że folder
`design_handoff_refswap/` (ten pakiet) leży w Twoim repo, żeby Claude Code mógł czytać pliki źródłowe.

---

Masz w repo folder `design_handoff_refswap/` z **wysokiej wierności prototypem (hifi)** aplikacji
**RefSwap** (peer-to-peer wymiana luksusowych zegarków, „Tinder for watches"). Pliki `proto-*.jsx` +
`RefSwap Prototype.html` to **referencja designu** zbudowana w React-przez-CDN z atrapami danych — NIE
wdrażaj ich tak jak są. Twoim zadaniem jest **odtworzyć ten design 1:1 w prawdziwym projekcie** i wpiąć
go w mój backend.

**Najpierw przeczytaj** `design_handoff_refswap/README.md` w całości — zawiera dokładne tokeny (kolory
hex, czcionki, odstępy, radius, cienie, animacje), specyfikację każdego ekranu, model danych i proponowany
kontrakt API. Traktuj `proto-data.jsx` jako źródło prawdy dla kolorów i kształtów danych.

## Stack docelowy
- React + **Vite** + **TypeScript** (jeśli mam już framework w repo, użyj mojego zamiast tego).
- Czcionki z Google Fonts: Cormorant Garamond, Inter, Spline Sans Mono.
- Stylowanie: [WYBIERZ: CSS Modules / Tailwind / styled-components — dopasuj do mojego repo]. Zachowaj
  **dokładnie** te same wartości hex/px/radius/shadow co w README.
- Routing: React Router — trasy `/browse`, `/my-watch`, `/matches`, `/messages/:id`, `/create`.

## Wymagania odtworzenia (pixel-perfect)
Zbuduj te ekrany dokładnie jak w prototypie, z zachowaniem układu, typografii, kolorów, stanów hover/active,
animacji (fadeIn/slideIn/toastIn, hover karty −3px) i responsywności (breakpointy 880px i 560px, dolny tab
bar na mobile):
1. **Header / dolny TabBar** z kropkami powiadomień (zielona = nowe matche, czerwona = nieprzeczytane).
2. **Browse** — siatka kart (3/2/1 kolumny), filtry (klasa cenowa, geografia, open-to-top-up), serce-lajk
   ze stanem gold, klik karty → wysuwany **WatchDrawer** ze szczegółami.
3. **My Watch** — własne ogłoszenie, status Active/Inactive, Edit/Delete.
4. **Matches** — oba zegarki obok siebie (⇄), odsłonięta tożsamość, badge „new", elegancki empty-state.
5. **Chat** — lista konwersacji + wątek, bąbelki (szare = oni, złote = ja), Report, composer (Enter wysyła).
6. **Create Listing** — 8-krokowy stepper z polami, dropzone zdjęć, kafelkami klas cenowych, wishlistą.

Zachowaj kształt stanu z `proto-app.jsx` (`view`/`liked`/`matches`/`activeChat`/`drawer`/`toast`) i te same
nazwy komponentów, żeby łatwo było mapować.

## Wpięcie backendu (zastąp atrapy)
Atrapy do podmiany: tablice `WATCHES`/`MY_WATCH`/`MATCHES`, logika `LIKES_YOU` (fałszywy „it's a match"),
`pickReply` (fałszywa odpowiedź w czacie), zapis do `localStorage`. Zamień na realne wywołania mojego API.

Mój backend: **[OPISZ: język/framework, np. Node+Express / FastAPI; sposób autoryzacji, np. JWT; adres,
np. http://localhost:3001]**.

Zaimplementuj warstwę API (np. `src/api/`) wg kontraktu z README:
- `POST /auth/login` (+ dołączanie tokenu `Authorization: Bearer` do każdego żądania)
- `GET /watches?tier=&geo=&topup=`
- `POST /likes {watchId}` → `{ liked, matched, match? }` (to **backend** decyduje o wzajemności)
- `GET /matches`, `GET /matches/:id/messages`, `POST /matches/:id/messages {text}`
- **WebSocket/SSE** do odbioru wiadomości i nowych matchy na żywo
- `GET/PUT /listings/me`, `POST /listings` (multipart na zdjęcia → URL-e ze storage)

Dodaj też to, czego nie ma w prototypie: **logowanie/rejestracja**, **upload zdjęć**, **routing URL**,
obsługa stanów ładowania/błędów. Jeśli czegoś w moim API brakuje — zaproponuj endpoint i zaślepkę, ale
nie zmieniaj wyglądu UI.

## Kolejność pracy
1. Inicjalizacja projektu + fonty + tokeny designu (z README/`proto-data.jsx`).
2. Wspólny chrome (Header, TabBar, PageHead, Toast) + routing.
3. Ekran po ekranie, każdy najpierw wizualnie 1:1 na atrapach, potem podmiana na API.
4. Auth → Browse → Likes/Matches → Chat (z WebSocketem) → My Watch/Create + upload.

Na koniec porównaj swój wynik z `RefSwap Prototype.html` otwartym w przeglądarce i wyrównaj różnice
wizualne. Pytaj, jeśli kontrakt API nie pasuje do mojego backendu.

---

> Uzupełnij fragmenty w `[NAWIASACH]` (stack, opis backendu, sposób autoryzacji) przed wysłaniem.
