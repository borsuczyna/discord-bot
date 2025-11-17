# Discord Bot - System Weryfikacji i Ticketów

Bot Discord napisany w TypeScript z systemem weryfikacji i ticketów.

## Funkcje

### System Weryfikacji
- Użytkownicy klikają przycisk, aby otrzymać rolę "zweryfikowany"
- Automatyczne nadawanie roli po kliknięciu
- Konfigurowalne wiadomości i kolory

### System Ticketów
- Kanał do tworzenia ticketów
- Automatyczne tworzenie prywatnych kanałów dla ticketów
- Personel z określonymi rolami może przyjmować tickety
- System uprawnień - tylko twórca ticketu i personel mają dostęp

## Instalacja

1. Zainstaluj Node.js (wersja 18 lub nowsza)

2. Sklonuj repozytorium i zainstaluj zależności:
```bash
npm install
```

3. Skonfiguruj bota w pliku `config.json`:
   - Dodaj token bota
   - Ustaw ID kanałów
   - Ustaw ID ról
   - Dostosuj teksty i kolory

## Konfiguracja

Edytuj plik `config.json`:

```json
{
  "token": "TWOJ_TOKEN_BOTA",
  "verification": {
    "channelId": "ID_KANALU_WERYFIKACJI",
    "roleId": "ID_ROLI_ZWERYFIKOWANY",
    "embedTitle": "Weryfikacja",
    "embedDescription": "Kliknij przycisk poniżej, aby uzyskać dostęp do serwera!",
    "embedColor": "#00ff00",
    "buttonLabel": "Zweryfikuj się"
  },
  "tickets": {
    "categoryId": "ID_KATEGORII_TICKETOW",
    "createChannelId": "ID_KANALU_TWORZENIA_TICKETOW",
    "staffRoleIds": ["ID_ROLI_PERSONELU_1", "ID_ROLI_PERSONELU_2"],
    "embedTitle": "System Ticketów",
    "embedDescription": "Kliknij przycisk poniżej, aby utworzyć ticket!",
    "embedColor": "#0099ff",
    "buttonLabel": "Utwórz Ticket",
    "acceptButtonLabel": "Przyjmij Ticket"
  }
}
```

### Jak uzyskać ID?

1. Włącz Tryb Dewelopera w Discord (Ustawienia -> Zaawansowane -> Tryb Dewelopera)
2. Kliknij prawym przyciskiem na kanał/rolę i wybierz "Kopiuj ID"

## Uprawnienia Bota

Bot wymaga następujących uprawnień:
- Manage Roles (Zarządzanie rolami)
- Manage Channels (Zarządzanie kanałami)
- View Channels (Przeglądanie kanałów)
- Send Messages (Wysyłanie wiadomości)
- Embed Links (Osadzanie linków)
- Read Message History (Odczytywanie historii wiadomości)
- Add Reactions (Dodawanie reakcji)

## Uruchomienie

### Tryb deweloperski (z ts-node):
```bash
npm run dev
```

### Tryb produkcyjny:
```bash
npm run build
npm start
```

## Struktura Projektu

```
discord-bot/
├── src/
│   ├── index.ts          # Główny plik bota
│   ├── verification.ts   # System weryfikacji
│   └── tickets.ts        # System ticketów
├── config.json           # Konfiguracja (token, ID kanałów/ról)
├── package.json          # Zależności
├── tsconfig.json         # Konfiguracja TypeScript
└── readme.md            # Ten plik
```

## Rozwiązywanie Problemów

### Bot się nie loguje
- Sprawdź czy token w `config.json` jest poprawny
- Upewnij się, że bot ma włączone odpowiednie intenty w Discord Developer Portal

### Przyciski nie działają
- Sprawdź czy bot ma uprawnienia do zarządzania rolami/kanałami
- Upewnij się, że ID w `config.json` są poprawne

### Tickety nie są tworzone
- Sprawdź czy kategoria istnieje
- Upewnij się, że bot ma uprawnienia do tworzenia kanałów w kategorii
