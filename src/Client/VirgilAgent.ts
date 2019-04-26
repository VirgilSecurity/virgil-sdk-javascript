import { OS_LIST } from '../Lib/platform/osList';
import { BROWSER_LIST } from '../Lib/platform/browserList';

/**
 * Class responsible for tracking which Virgil SDK is being used to make requests, its version,
 * browser and platform.
 */
export class VirgilAgent {

	value: string;
	private userAgent: string;
	/**
	 * Returns navigator.userAgent string or '' if it's not defined.
	 * @return {string} user agent string
	 */

	private getUserAgent(): string {
		if (typeof navigator !== "undefined" && typeof navigator.userAgent === "string") {
			return navigator.userAgent;
		} else {
			return "";
		}
	}

	/**
	 * Initializes a new instance of `Connection`.
	 * @param {string} product - name of product eg (sdk, brainkey, bpp, keyknox, ratchet, e3kit, purekit)
	 * argument of request methods.
	 * @param {string} version - version of the product.
	 * @param {string} userAgent - string with device user agent. Optional
	 */
	constructor(
		product: string,
		version: string,
		userAgent?: string
	) {
		this.userAgent = userAgent || this.getUserAgent();
		this.value = `${product};js;${this.getHeaderValue()};${version}`;
	};

	/**
	 * Detects device OS
	 * @returns {string} returns OS if detected or 'other'.
	 */
	getOsName() {
		const os = OS_LIST.find((os) => {
			if (os.test.some(condition => condition.test(this.userAgent))) return true;
			return false;
		});

		return os ? os.name : 'other';
	}

	/**
	 * Detects device browser
	 * @returns {string} returns browser if detected of 'other'.
	 */
	getBrowser() {
		const browser = BROWSER_LIST.find((browser) => {
			if (browser.test.some(condition => condition.test(this.userAgent))) return true;
			return false;
		});

		return browser ? browser.name : 'other';
	}

	/**
	 * Detect React Native.
	 * @return {boolean} true if detects ReactNative .
	 */
	private isReactNative(): boolean {
		return typeof navigator === "object" && navigator.product === "ReactNative";
	}

	/**
	 * Detect Node.js.
	 * @return {boolean} true if detects Node.js.
	 */
	private isNodeSdk = (): boolean => !process.env.browser && !!process.platform;

	/**
	 * Detect Cordova / PhoneGap / Ionic frameworks on a mobile device.
	 * @return {boolean} true if detects Ionic.
	 */
	private isIonic = (): boolean =>
		typeof window !== "undefined" &&
		!!("cordova" in window || "phonegap" in window || "PhoneGap" in window) &&
		/android|ios|iphone|ipod|ipad|iemobile/i.test(this.userAgent);

	/**
	 * Return infomation for `virgil-agent` header.
	 * @return {string} string in format: PRODUCT;FAMILY;PLATFORM;VERSION
	 */
	private getHeaderValue() {
		try {
			if (this.isReactNative()) return "ReactNative";
			if (this.isNodeSdk()) return `Node.${process.platform}`;
			if (this.isIonic()) return `Ionic.${this.getOsName()}`;
			return `${this.getBrowser()}.${this.getOsName()}`;
		} catch (e) {
			return `Unknown`;
		}
	}
}
