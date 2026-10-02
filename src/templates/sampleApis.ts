import { ApiEndpointConfig } from '../core/types';

export interface ApiTemplate {
  id: string;
  name: string;
  description: string;
  endpoint: ApiEndpointConfig;
  schema: Record<string, unknown>;
  payload: Record<string, unknown>;
}

export const SAMPLE_APIS: ApiTemplate[] = [
  {
    id: 'user-registration',
    name: 'User Registration API',
    description: 'Standard authentication signup endpoint with username, password constraints, email, age boundary, and tags.',
    endpoint: {
      name: 'Create User',
      method: 'POST',
      url: 'https://api.example.com/v1/auth/register',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    },
    schema: {
      "$schema": "http://json-schema.org/draft-07/schema#",
      "title": "UserRegistration",
      "type": "object",
      "required": ["username", "email", "age", "password", "role"],
      "properties": {
        "username": {
          "type": "string",
          "minLength": 3,
          "maxLength": 20,
          "description": "Unique user handle"
        },
        "email": {
          "type": "string",
          "format": "email",
          "maxLength": 100,
          "description": "User email address"
        },
        "age": {
          "type": "integer",
          "minimum": 18,
          "maximum": 120,
          "description": "Age of the user (must be an adult)"
        },
        "password": {
          "type": "string",
          "minLength": 8,
          "maxLength": 64
        },
        "role": {
          "type": "string",
          "enum": ["member", "moderator", "admin"]
        },
        "isSubscribed": {
          "type": "boolean"
        },
        "tags": {
          "type": "array",
          "minItems": 1,
          "maxItems": 5,
          "items": {
            "type": "string",
            "maxLength": 15
          }
        },
        "profile": {
          "type": "object",
          "required": ["bio"],
          "properties": {
            "bio": {
              "type": "string",
              "maxLength": 200
            },
            "website": {
              "type": "string",
              "format": "uri"
            }
          }
        }
      }
    },
    payload: {
      "username": "alex_qa_pro",
      "email": "alex.test@example.com",
      "age": 28,
      "password": "SecurePassword123!",
      "role": "member",
      "isSubscribed": true,
      "tags": ["automation", "testing"],
      "profile": {
        "bio": "Senior QA Automation Engineer passionate about API resilience testing.",
        "website": "https://example.com"
      }
    }
  },
  {
    id: 'payment-checkout',
    name: 'Payment Checkout API',
    description: 'E-commerce payment order endpoint with transaction amount, currency, items array, and card metadata.',
    endpoint: {
      name: 'Process Payment Order',
      method: 'POST',
      url: 'https://api.example.com/v1/payments/checkout',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer {{jwtToken}}',
      },
      auth: {
        type: 'bearer',
        token: '{{jwtToken}}'
      }
    },
    schema: {
      "$schema": "http://json-schema.org/draft-07/schema#",
      "title": "PaymentCheckout",
      "type": "object",
      "required": ["orderId", "amount", "currency", "items"],
      "properties": {
        "orderId": {
          "type": "string",
          "minLength": 10,
          "maxLength": 36
        },
        "amount": {
          "type": "number",
          "minimum": 0.50,
          "maximum": 10000.00,
          "description": "Total checkout value in currency units"
        },
        "currency": {
          "type": "string",
          "enum": ["USD", "EUR", "GBP", "CAD", "JPY"]
        },
        "items": {
          "type": "array",
          "minItems": 1,
          "maxItems": 10,
          "items": {
            "type": "object",
            "required": ["sku", "quantity", "unitPrice"],
            "properties": {
              "sku": { "type": "string", "minLength": 4 },
              "quantity": { "type": "integer", "minimum": 1, "maximum": 50 },
              "unitPrice": { "type": "number", "minimum": 0.01 }
            }
          }
        },
        "metadata": {
          "type": "object",
          "properties": {
            "source": { "type": "string" },
            "isExpress": { "type": "boolean" }
          }
        }
      }
    },
    payload: {
      "orderId": "ORD-2026-987654",
      "amount": 149.99,
      "currency": "USD",
      "items": [
        {
          "sku": "ITEM-KB-990",
          "quantity": 1,
          "unitPrice": 149.99
        }
      ],
      "metadata": {
        "source": "web_storefront",
        "isExpress": false
      }
    }
  }
];
