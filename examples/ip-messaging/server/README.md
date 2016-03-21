## Join channel

Join to channel using specified identifier.
After joining user will remain active in channel until manual `leave` request

#### Request

```
POST /channels/{channel_name}/join
```

```json
{
	"identifier": "user@example.com"
}
```

#### Response

```
{
	"identity_token": "123yatoken456"
}
```

## Get list of channel members

#### Request

```
GET /channels/{channel_name}/members
```

#### Request Headers

```
X-IDENTITY-TOKEN: IDENTITY_TOKEN
```

#### Response

```json
[
	{
		"identifier": "member1@example.com"
	},
	{
		"identifier": "member2@example.com"
	}
]
```

## Post message to channel

Messages are JSON objects with strict structure

#### Request

```
POST /channels/{channel_name}/messages
```

You can use any message structure (any property names and any number of properties except `id` and `created_at`).
Message body example:

```json
{
	"message": "This is message"
}
```

#### Request Headers

```
X-IDENTITY-TOKEN: IDENTITY_TOKEN
```

#### Response

```
```

## Get channel messages

#### Request

```
GET /channels/{channel_name}/messages?last_message_id=10032
```

##### Params
	
- `last_message_id` - will return messages after specified id

#### Request Headers

```
X-IDENTITY-TOKEN: IDENTITY_TOKEN
```

#### Response

```json
[
	{
		"id": 123,
		"created_at": 2318893224,
		"sender_identifier": "user@example.com",
		"message": "some message content"
	},
	{
		"id": 127,
		"created_at": 2318893624,
		"sender_identifier": "user2@example.com",
		"message": "some message content"
	}
]
```

- `created_at` - unix timestamp
