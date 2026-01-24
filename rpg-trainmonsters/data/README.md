# Sistema de Mapas - RPG Train Monsters

## Estructura

```
data/
├── config.json           # Configuración principal del juego y referencias de mapas
└── tilemaps/
    ├── tilemap_start.json       # Mapa principal del juego
    └── tilemap_building.json    # Ejemplo: Interior de un edificio
```

## Configuración (config.json)

El archivo `config.json` define:
- Metadatos del juego (título, versión)
- Referencias a todos los tilemaps disponibles
- Posición inicial del jugador para cada mapa

Ejemplo:
```json
{
  "tilemaps": {
    "start": {
      "name": "Mundo Principal",
      "path": "data/tilemaps/tilemap_start.json",
      "playerStart": { "x": 10, "y": 10 }
    }
  }
}
```

## Formato de Tilemaps (JSON)

Cada archivo JSON de tilemap tiene la siguiente estructura:

```json
{
  "width": 20,
  "height": 15,
  "tileSize": 32,
  "name": "Nombre del Mapa",
  "tiles": [
    [0, 0, 0, ...],    // Array 2D con IDs de terrenos
    [0, 0, 0, ...],
    ...
  ],
  "portals": [
    {
      "x": 6,
      "y": 8,
      "destination": "data/tilemaps/otro_mapa.json",
      "destinationStart": { "x": 5, "y": 8 }
    }
  ]
}
```

### Propiedades:
- **width**: Ancho del mapa en tiles
- **height**: Alto del mapa en tiles
- **tileSize**: Tamaño de cada tile en píxeles (típicamente 32)
- **name**: Nombre descriptivo del mapa
- **tiles**: Array 2D con IDs de terrenos (ver tabla abajo)
- **portals**: Array de portales que teletransportan al jugador a otro mapa

## IDs de Terrenos

| ID | Nombre | Tipo | Caminable | Zona Caza |
|----|--------|------|-----------|-----------|
| 0  | Pasto | grass | ✓ | ✗ |
| 1  | Agua | water | ✗ | ✗ |
| 2  | Montaña | mountain | ✗ | ✗ |
| 3  | Arena | sand | ✓ | ✓ |
| 4  | Bosque | forest | ✓ | ✓ |
| 5  | Piedra | stone | ✓ | ✗ |
| 6  | Nieve | snow | ✓ | ✓ |
| 7  | Lava | lava | ✗ | ✗ |
| 8  | Pasto de Caza | hunting_grass | ✓ | ✓ |
| 9  | Portal | portal | ✓ | ✗ |

## Crear un Nuevo Mapa

1. Crear un nuevo archivo JSON en `data/tilemaps/` con la estructura descrita
2. Llenar el array `tiles` con los IDs de terrenos deseados
3. Agregar portales si el mapa tiene conexiones a otros mapas
4. Registrar el mapa en `config.json`

### Ejemplo: Interior de Casa

```json
{
  "width": 8,
  "height": 8,
  "tileSize": 32,
  "name": "Casa",
  "tiles": [
    [5, 5, 5, 5, 5, 5, 5, 5],
    [5, 0, 0, 0, 0, 0, 0, 5],
    [5, 0, 0, 0, 0, 0, 0, 5],
    [5, 0, 0, 0, 0, 0, 0, 5],
    [5, 0, 0, 0, 0, 0, 0, 5],
    [5, 0, 0, 0, 9, 0, 0, 5],
    [5, 0, 0, 0, 0, 0, 0, 5],
    [5, 5, 5, 5, 5, 5, 5, 5]
  ],
  "portals": [
    {
      "x": 4,
      "y": 5,
      "destination": "data/tilemaps/tilemap_start.json",
      "destinationStart": { "x": 10, "y": 10 }
    }
  ]
}
```

## Cómo Funciona en el Juego

1. Al iniciar, el juego carga `tilemap_start.json`
2. Cuando el jugador pisa un tile con ID 9 (Portal), el juego detecta esto automáticamente
3. Se ejecuta `game.changeTileMap()` con la ruta del destino
4. El jugador es teletransportado a la posición indicada en `destinationStart`

## Archivos Relacionados

- `js/tilemap-loader.js`: Gestiona la carga de archivos JSON
- `js/game.js`: Método `changeTileMap()` y detección de portales
- `js/tilemap.js`: Clase TileMap con propiedades de portales
