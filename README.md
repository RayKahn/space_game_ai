# Cosmic Defender

A space shooter game built with p5.js. Defend the galaxy from invading enemies, collect power-ups, and try to achieve the highest score! This game was generated using the following prompt to `Claude-3.7-Sonnet`:

"design a p5js implementation of a space shooting game. It must be extremely polished and I want you to build all the sprites and assets yourself.  I don't want to import any assets."

Additional prompt improved the game with the addition of `esc` command:

"refactor the game and add an esc feature to terminte an existing game and take the user back to the prompt screen of the game. Make sure that you update the landing screen to let the user know about this additional functionality."


## Features

- Mouse-controlled spaceship
- Multiple enemy types with unique behaviors
- Power-up system including:
  - Extra lives
  - Shield protection
  - Enemy clearing
- Progressive difficulty system
- Sound effects
- Score tracking
- Level progression

## Controls

- **Mouse**: Move the spaceship
- **Click or Space**: Shoot
- **ESC**: Return to menu
- **ENTER**: Start game/Continue

## How to Play

1. Open the game in your web browser
2. Press ENTER to start
3. Use your mouse to control the spaceship
4. Shoot enemies to score points
5. Collect power-ups for advantages
6. Try to survive as long as possible!

## Technologies Used

- p5.js
- JavaScript
- HTML5 Canvas

## Local Setup Instructions

### Prerequisites
- A modern web browser (Chrome, Firefox, Safari, or Edge)
- Git (for cloning the repository)

### Step-by-Step Setup

1. **Clone the Repository**
   ```bash
   git clone https://github.com/RayKahn/space_game_ai.git
   cd space_game_ai
   ```

2. **Running the Game**
   There are several ways to run the game locally:

   #### Method 1: Using Python's built-in server (Recommended)
   ```bash
   # If you have Python 3 installed:
   python3 -m http.server 8000
   
   # If you have Python 2 installed:
   python -m SimpleHTTPServer 8000
   ```
   Then open your browser and go to: `http://localhost:8000`

   #### Method 2: Using Node.js http-server
   ```bash
   # Install http-server globally (if you have Node.js installed)
   npm install -g http-server
   
   # Run the server
   http-server
   ```
   Then open your browser and go to: `http://localhost:8080`

   #### Method 3: Direct file opening
   Simply double-click the `index.html` file in your file explorer to open it in your default browser.
   Note: Some browsers might have security restrictions that prevent the game from working properly when opened directly.

### Troubleshooting

If you encounter any issues:

1. Make sure you're using a modern web browser
2. Check that all files are present in the repository:
   - `index.html`
   - `sketch.js`
   - `style.css`
3. If using Method 1 or 2, ensure no other application is using port 8000 or 8080
4. If the game doesn't load, try clearing your browser cache and refreshing the page

## License

This project is open source and available under the MIT License. 
