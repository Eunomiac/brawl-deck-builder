# Linear Workspace Reference

This document contains Linear workspace configuration details for efficient API usage.

## Team Information
- **Team Name**: MTG Brawl Deck Builder
- **Team ID**: `2de9825f-eec3-4b26-9f23-8f3e5855634c`

## Workflow States

### State IDs (UUIDs)

- **Backlog**: `1bd4dbc5-280c-4500-9572-a2fb6bac9b08`
- **Todo**: `65f77b70-a5e0-49b7-822b-b7b8ab498dd0`
- **In Progress**: `1cf3933f-c5c5-4750-8099-39e1a8fa47f1`
- **In Review**: `f37e0180-5da6-45ba-996d-4c307a7089d0`
- **Done**: `4c2b1ff7-670b-439d-a06d-24699ddf11a2`
- **Canceled**: `bc5751ee-9de5-444b-bf78-f9920dd0f1b7`
- **Duplicate**: `191aafe1-b549-42b8-a86e-5abd75638fb3`

### Priority Levels
- **Urgent**: 1
- **High**: 2
- **Medium**: 3
- **Low**: 4

## Labels

### Label IDs (UUIDs)

#### Phase Labels
- **Phase 0 - Workspace Setup**: `e9e5a3ec-ea30-4e41-b705-083985b2726f`
- **Phase 1 - Foundation**: `d6e25021-a31c-41e6-89d4-055035ec170a`
- **Phase 2 - Collection & Validation**: `102a6e59-2f19-4384-9162-e6d134a63962`
- **Phase 3 - Analysis & External Data**: `e93b2091-a7d1-432f-bdae-9c9a4ee3025c`
- **Phase 4 - Advanced Features**: `8484952c-766f-4a12-b0f0-16483f8a27da`
- **Phase 5 - Prep for Public Release**: `b967ea02-cbc0-4fe3-b4a1-d980b2ee37d1`

#### Category Labels
- **Infrastructure**: `4c87ffd6-92b3-4324-909a-7dcc1e9d5ea7`
- **Database**: `e9b554a7-fc66-4ece-bd53-0b76fcc4e7cf`
- **Frontend & UI**: `5ecb8074-e30d-4f4f-a51c-4706ca616f1a`
- **Import & Export**: `0b128e0d-686e-4043-8c26-acf37d51bb56`
- **Search & Filtering**: `16d645dd-f69b-43de-891d-0af4aac7cec1`
- **Validation & Rules**: `aa6a1b45-8f37-493f-b6e8-01e402cd6ad4`
- **Analysis & Recommendations**: `ac43904f-fbcc-4877-a077-e32c38d495ae`

## User Information
- **User ID**: `39f27296-cc69-477a-b81b-bdf385dea282`
- **Name**: Ryan West
- **Email**: ryan.o.west@gmail.com

## Common Linear API Patterns

### Update Issue State
```
Update issue [IDENTIFIER] to state with UUID [STATE_UUID]
```

### Create Issue
```
Create issue with title "[TITLE]" and description "[DESCRIPTION]" in team UUID 2de9825f-eec3-4b26-9f23-8f3e5855634c
```

### Assign Issue
```
Assign issue [IDENTIFIER] to user UUID 39f27296-cc69-477a-b81b-bdf385dea282
```

---

**Note**: This reference document contains all current Linear workspace UUIDs for efficient API operations. Update as needed when workspace configuration changes.
