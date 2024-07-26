const Constants = {
    PROJECT: {
        NAME: "TeleMedicinService",
    },
    STATE: {
        ALL: "All",
    },
    CURRENT_SCHEMA: process.env.DATABASE_SCHEMA,
    DEFAULT_PORTAL_ID: 1,
    CACHING_PERIOD: "1 hour",
    TOKEN_EXPIRE_DAYS: "30d",
    ONE_MONTH: "30d",
    ONE_HOUR: "1h",
    ONE_DAY: "1d",
    DEFAULT_LIMIT: 10,
    DEFAULT_OFFSET: 0,
    DEFAULT_SORT_COLUMN: "updatedDate",
    DEFAULT_LITE_SORT_COLUMN: "name",
    ORDER: {
        ASC: "ASC",
        DESC: "DESC",
    },

    CACHING_PERIOD: "1 hour",
    DEFAULT_LOCALE: "en-AU",

    LOGS: {
        INFO: "INFO",
        WARN: "WARN",
        ERROR: "ERROR",
        CRITICAL_ERROR: "CRITICAL_ERROR",
    },

    UNWANTED_LOGGING_URLS: [],

    API_METHOD: {
        GET: "GET",
        POST: "POST",
    },
    SORT_ORDER: {
        HIGH_TO_LOW: "HIGH_TO_LOW",
        LOW_TO_HIGH: "LOW_TO_HIGH",
    },

    SOCKET: {},

    ROLE: {
        ADMIN: "ADMIN",
        CUSTOMER: "CUSTOMER",
        USER: "USER",
    },

    SOCIAL_NETWORK: {
        GOOGLE: "GOOGLE",
        FACEBOOK: "FACEBOOK",
    },

    USER_ROLES: {
        PORTAL_ADMIN: "PORTAL_ADMIN",
        PORTAL_USER: "PORTAL_EMPLOYEE",
        AGENCY_ADMIN: "AGENCY_ADMIN",
        AGENCY_EMPLOYEE: "AGENCY_EMPLOYEE",
        MGA_ADMIN: "MGA_ADMIN",
        MGA_EMPLOYEE: "MGA_EMPLOYEE",
        // CUSTOMER_ADMIN: "CUSTOMER_ADMIN",
        // CUSTOMER_USER: "CUSTOMER_USER",
    },
    DEFAULT_TOKEN_LENGTH: 32,
    USER_TYPES: {
        USER: "USER",
        CUSTOMER: "CUSTOMER",
    },
    STATUS: {
        ACTIVE: "active",
        INACTIVE: "inactive",
    },
    SYSTEM_TYPE: {
        INTERNAL: "internal",
        WEB: "web",
        API: "api",
    },

    BUSINESS_TYPES: {
        MGA: "MGA",
        AGENCY: "AGENCY",
        PORTAL: "PORTAL",
    },
    QUOTE_MODULE_SCREENS: {
        INITIATE_APPLICATION: "Initiate Application",
        COLLECT_DATA: "Collect Data",
        CREATE_PROPOSAL: "Create Proposal",
        SIGN_PROPOSAL: "Sign Proposal",
        PAYMENT: "Payment",
        UPLOAD_POLICY: "Upload Policy",
    },
    VERSION_DIFF: 0.1,

    SET_ADMIN_ROLE: (businessType) => `${businessType}_ADMIN`,
    SET_EMPLOYEE_ROLE: (businessType) => `${businessType}_EMPLOYEE`,
};

module.exports = Constants;
