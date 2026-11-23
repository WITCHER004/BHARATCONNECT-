/*
  Camera for showing the 16:9 launch film on portrait phones.
  FILM_CROP is the share of the frame width shown; FILM_FOCUS[i] is the horizontal centre (0-1)
  of that window for frame i. The current film keeps the BC logo and title centred, so the
  window stays centred throughout.
*/
export const FILM_CROP = 0.58;
export const FILM_FOCUS = new Array(300).fill(0.5);
