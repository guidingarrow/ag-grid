export declare class LicenseManager {
    private static RELEASE_INFORMATION;
    private static licenseKey;
    private md5;
    validateLicense(): void;
    private static extractExpiry;
    private static extractLicenseComponents;
    getLicenseDetails(licenseKey: string): {
        licenseKey: string;
        valid: boolean;
        expiry: string | null;
    };
    private static outputMessage;
    private static formatDate;
    private static getGridReleaseDate;
    private static decode;
    private static utf8_decode;
    static setLicenseKey(licenseKey: string): void;
}
