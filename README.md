# Vibe Code Words Magnetic Repulsive Effect

## Demo

<video src="src/assets/demo.mov"></video>

## STEP 1: SETUP

- create a canvas (700 x 200 pixels)
- multiply canvas size by devicePixelRatio for sharp rendering

## STEP 2: BUILD THE STENCIL

- draw "adora wyne" in BIG 120px font onto the canvas
  (this is temporary — we just need the pixel data)

- read ALL pixel data from canvas → gives us [R, G, B, A] for every pixel

- create empty particles list

- for each pixel (skipping every 5th for performance):
  - if this pixel has ink (alpha > 128):
    - create a particle:
      - homeX, homeY = where this pixel lives
      - x, y = same as home (starts at home)
      - vx, vy = 0 (no movement yet)
      - char = random character from "abc...@#$..."
    - add particle to list

- clear the canvas (the big text was just a stencil, throw it away)

## STEP 3: ANIMATION LOOP (runs 60x per second)

- every frame:
  - clear the canvas

  - for each particle:
    - **FORCE 1: REPULSION**
    - measure distance from particle to mouse cursor
    - if distance < 80px:
      - push particle AWAY from cursor
      - closer = stronger push (squared falloff)

    - **FORCE 2: SPRING**
      - pull particle back toward its homeX, homeY
      - (gentle — only 8% of the gap each frame)

    - **FORCE 3: FRICTION**
      - multiply velocity by 0.85
      - (so particles slow down naturally)

    - **UPDATE**
      - particle.x += particle.vx
      - particle.y += particle.vy

    - **DRAW**
      - calculate how far particle is from home
      - farther from home = more opaque (brighter when scattered)
      - draw particle.char at particle.x, particle.y

## STEP 4: MOUSE TRACKING

- on mouse move over the card:
  - store cursor position relative to canvas

- on mouse leave:
  - set cursor to (-9999, -9999) so no particles are affected

## STEP 5: TEXTURE SHIMMER

- every 300ms:
  - for each particle:
    - 3% chance → swap its character for a new random one
- (this makes the text feel alive, like a screen flickering)
