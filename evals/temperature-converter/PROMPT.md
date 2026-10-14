Create a Svelte 5 temperature converter with:

- Three `<input type="number">` fields: Celsius (`data-testid="celsius-input"`), Fahrenheit (`data-testid="fahrenheit-input"`), Kelvin (`data-testid="kelvin-input"`)
- Changing any input updates the others as the user types (F = C × 9/5 + 32, K = C + 273.15)
- Handle decimals with reasonable precision: converted values are rounded to at most 2 decimal places, with no floating point noise (e.g. 25.5 °C shows `77.9` °F and `298.65` K; 373.15 K shows `100` °C)
- The user must be able to clear a field and type a new value (including decimals like `373.15`) without the field being rewritten while typing

Create the component in `src/routes/+page.svelte` without importing other components
