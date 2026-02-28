# API Error Codes

This document lists structured `errorCode` values returned by GoGoHockey API routes.

All `errorCode` values are uppercase snake case and are intended for frontend branching/logging.

---

## Common

| errorCode | Meaning |
|---|---|
| `INVALID_JSON` | Request body is not valid JSON |
| `GAME_NOT_FOUND` | Target game is missing or user has no permission |

---

## Booking APIs

### `POST /api/bookings/create-checkout`

| errorCode | HTTP | Meaning |
|---|---:|---|
| `INVALID_JSON` | 400 | Invalid JSON payload |
| `INVALID_BOOKING_PAYLOAD` | 400 | Failed Zod validation for booking checkout fields |

### `POST /api/bookings/cancel`

| errorCode | HTTP | Meaning |
|---|---:|---|
| `INVALID_JSON` | 400 | Invalid JSON payload |
| `INVALID_CANCEL_PAYLOAD` | 400 | Failed Zod validation for cancel payload |

### `POST /api/bookings/send-confirmation`

| errorCode | HTTP | Meaning |
|---|---:|---|
| `INVALID_JSON` | 400 | Invalid JSON payload |
| `INVALID_CONFIRMATION_PAYLOAD` | 400 | Failed Zod validation for email confirmation payload |

---

## Game APIs

### `POST /api/games/create`

| errorCode | HTTP | Meaning |
|---|---:|---|
| `INVALID_JSON` | 400 | Invalid JSON payload |
| `INVALID_GAME_PAYLOAD` | 400 | Failed Zod validation for create payload |
| `CREATE_GAME_FAILED` | 500 | Database write failed while creating game |

### `POST /api/games/update`

| errorCode | HTTP | Meaning |
|---|---:|---|
| `INVALID_JSON` | 400 | Invalid JSON payload |
| `INVALID_GAME_UPDATE_PAYLOAD` | 400 | Failed Zod validation for update payload |
| `UPDATE_GAME_FAILED` | 500 | Database write failed while updating game |
| `GAME_NOT_FOUND` | 404 | Game missing or user not owner |

### `POST /api/games/status`

| errorCode | HTTP | Meaning |
|---|---:|---|
| `INVALID_JSON` | 400 | Invalid JSON payload |
| `INVALID_GAME_STATUS_PAYLOAD` | 400 | Failed Zod validation for status update payload |
| `GAME_STATUS_UPDATE_FAILED` | 500 | Database write failed while updating status |
| `GAME_NOT_FOUND` | 404 | Game missing or user not owner |

### `POST /api/games/delete`

| errorCode | HTTP | Meaning |
|---|---:|---|
| `INVALID_JSON` | 400 | Invalid JSON payload |
| `INVALID_GAME_DELETE_PAYLOAD` | 400 | Failed Zod validation for delete payload |
| `GAME_DELETE_FAILED` | 500 | Database delete failed |
| `GAME_NOT_FOUND` | 404 | Game missing or user not owner |

### `POST /api/games/view`

| errorCode | HTTP | Meaning |
|---|---:|---|
| `INVALID_JSON` | 400 | Invalid JSON payload |
| `INVALID_GAME_VIEW_PAYLOAD` | 400 | Failed Zod validation for view payload |
| `GAME_NOT_FOUND` | 404 | Target game not found |
| `GAME_VIEW_UPDATE_FAILED` | 500 | Database write failed while incrementing view counter |

### `POST /api/games/interest`

| errorCode | HTTP | Meaning |
|---|---:|---|
| `INVALID_JSON` | 400 | Invalid JSON payload |
| `INVALID_INTEREST_PAYLOAD` | 400 | Failed Zod validation for interest payload |
| `CREATE_INTEREST_FAILED` | 500 | Database write failed while creating interest |

### `DELETE /api/games/interest`

| errorCode | HTTP | Meaning |
|---|---:|---|
| `INVALID_JSON` | 400 | Invalid JSON payload |
| `INVALID_INTEREST_PAYLOAD` | 400 | Failed Zod validation for interest payload |
| `DELETE_INTEREST_FAILED` | 500 | Database delete failed while removing interest |

### `POST /api/games/interest/remove`

| errorCode | HTTP | Meaning |
|---|---:|---|
| `INVALID_JSON` | 400 | Invalid JSON payload |
| `INVALID_INTEREST_REMOVE_PAYLOAD` | 400 | Failed Zod validation for remove-interest payload |
| `INTEREST_NOT_FOUND` | 404 | Interest row missing or user not owner |
| `INTEREST_REMOVE_FAILED` | 500 | Database failure while removing interest |

### `POST /api/games/rate`

| errorCode | HTTP | Meaning |
|---|---:|---|
| `INVALID_JSON` | 400 | Invalid JSON payload |
| `INVALID_RATING_PAYLOAD` | 400 | Failed Zod validation for rating payload |
| `GAME_NOT_FOUND` | 404 | Target game not found |
| `RATING_NOT_ALLOWED` | 400 | Game is not in a ratable status |
| `OPPONENT_NOT_FOUND` | 400 | Opponent cannot be determined from game context |
| `RATING_ALREADY_EXISTS` | 409 | User already rated this game |
| `CREATE_RATING_FAILED` | 500 | Database write failed while creating rating |

---

## Rink Management APIs

### `POST /api/rinks/update`

| errorCode | HTTP | Meaning |
|---|---:|---|
| `INVALID_JSON` | 400 | Invalid JSON payload |
| `INVALID_RINK_UPDATE_PAYLOAD` | 400 | Failed Zod validation for rink update payload |
| `RINK_MANAGER_REQUIRED` | 403 | User is not a verified manager for target rink |
| `RINK_UPDATE_FAILED` | 500 | Database update failed |
