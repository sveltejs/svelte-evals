# Timer/Stopwatch Component

Create a Svelte 5 timer with:

- Start/Pause/Reset controls
- Lap recording
- Display in MM:SS.ms format
- Optional countdown mode

## Requirements

1. **Timer State**: Track elapsed time in milliseconds
2. **Controls**:
    - Start button to begin counting
    - Pause button to stop counting (preserves elapsed time)
    - Reset button to clear timer and laps
    - Lap button to record current time
3. **Display**: Show time in MM:SS.ms format, zero padded, where `ms` is two digits (hundredths of a second), e.g. "01:30.50" for 1 minute, 30 seconds, 500 milliseconds. Initially "00:00.00"
4. **Laps**: Store and display list of recorded lap times. Each lap shows the total elapsed time at the moment it was recorded (not the split since the previous lap), in the same MM:SS.ms format, in the order they were recorded (first lap first)

## Markup

- Time display: `data-testid="display"`
- Buttons: `data-testid="start"`, `data-testid="pause"`, `data-testid="reset"`, `data-testid="lap"`. Start must be rendered while the timer is not running; pause, reset and lap must be rendered while it is running
- Each recorded lap: `data-testid="lap-{index}"` with a zero-based index (`lap-0` is the first recorded lap). No lap elements are rendered when there are no laps (e.g. after reset)

## Technical Requirements

- Use `$state()` for reactive state (elapsed time, running status, laps array)
- Use `$derived()` for computed values (formatted time display)
- Use `$effect()` with proper cleanup for the interval timer
- The interval should update every 10ms for smooth display

Create the component in `src/routes/+page.svelte` without importing other components
