const WEEKDAY_KEYS = ["domingo", "segunda", "terca", "quarta", "quinta", "sexta", "sabado"];

function isOpenNow(date) {
  date = date || new Date();
  const hours = CONFIG.OPENING_HOURS[WEEKDAY_KEYS[date.getDay()]];
  if (!hours) return false;
  const [openH, openM] = hours.open.split(":").map(Number);
  const [closeH, closeM] = hours.close.split(":").map(Number);
  const minutesNow = date.getHours() * 60 + date.getMinutes();
  return minutesNow >= openH * 60 + openM && minutesNow < closeH * 60 + closeM;
}

function getTodayHoursLabel(date) {
  date = date || new Date();
  const hours = CONFIG.OPENING_HOURS[WEEKDAY_KEYS[date.getDay()]];
  if (!hours) return "Fechado hoje";
  return `Hoje: ${hours.open} às ${hours.close}`;
}
