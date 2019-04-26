// Order of browsers matters! Edge, Opera and Chromium have Chrome in User Agent.

export const BROWSER_LIST = [
  {
	test: [/googlebot/i],
	name: 'Googlebot'
  },
  {
	test: [/opera/i, /opr\/|opios/i],
	name: 'Opera',
  },
  {
	test: [/msie|trident/i],
	name: 'Internet Explorer',
  },
  {
	test: [/\sedg/i],
	name: 'Microsoft Edge'
  },
  {
	test: [/firefox|iceweasel|fxios/i],
	name: 'Firefox',
  },
  {
	test: [/chromium/i],
	name: 'Chromium'
  },
  {
	test: [/chrome|crios|crmo/i],
	name: 'Chrome',
  },
  {
	test: [/android/i],
	name: 'Android Browser'
  },
  {
	test: [/playstation 4/i],
	name: 'PlayStation 4',
  },
  {
	test: [/safari|applewebkit/i],
	name: 'Safari',
  }
];
