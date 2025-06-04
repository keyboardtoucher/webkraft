import { useEffect, useState } from "react"
import { addPropertyControls, ControlType } from "framer"

export default function CustomizableBrowserFingerprint(props) {
    const {
        // Display settings
        showColorDepth = true,
        showCookiesEnabled = true,
        showDoNotTrack = true,
        showJavaEnabled = true,
        showUserAgent = true,
        showScreenDetails = true,
        showWebGLInfo = true,
        showFonts = true,
        showPlugins = false,
        maxPlugins = 5,
        maxFonts = 5,

        // Appearance
        backgroundColor = "#f5f5f5",
        textColor = "#333333",
        accentColor = "#0066cc",
        fontSize = 14,
        fontFamily = "Arial, sans-serif",
        cornerRadius = 8,

        // Padding settings
        useSinglePadding = true,
        padding = 16,
        paddingTop = 16,
        paddingRight = 16,
        paddingBottom = 16,
        paddingLeft = 16,

        showTitle = true,

        // Size and Scroll
        fixedHeight = false,
        maxHeight = 500,
        enableScroll = true,
        scrollbarStyle = "auto", // "auto", "thin", "none", "custom"
        alwaysShowScrollbar = false,
        scrollbarWidth = 8,
        scrollbarLength = 100, // percentage
        scrollbarBorderRadius = 4,
        useGradient = false,
        scrollbarStartColor = "#bbbbbb",
        scrollbarEndColor = "#999999",
        scrollbarOpacity = 100, // 0-100

        // Section titles
        title = "Browser Fingerprint Information",
        basicInfoTitle = "Basic Information",
        screenDetailsTitle = "Screen Details",
        webGLInfoTitle = "WebGL Information",
        userAgentTitle = "User Agent",
        detectedFontsTitle = "Detected Fonts",
        browserPluginsTitle = "Browser Plugins",

        // Basic Info Labels
        colorDepthLabel = "Color Depth:",
        cookiesEnabledLabel = "Cookies Enabled:",
        doNotTrackLabel = "Do Not Track:",
        javaEnabledLabel = "Java Enabled:",

        // Screen Details Labels
        screenResolutionLabel = "Screen Resolution:",
        availableResolutionLabel = "Available Resolution:",
        colorDepthScreenLabel = "Color Depth:",
        pixelDepthLabel = "Pixel Depth:",

        // WebGL Labels
        rendererLabel = "Renderer:",
        vendorLabel = "Vendor:",

        // Status messages
        yesText = "Yes",
        noText = "No",
        enabledText = "Enabled",
        disabledText = "Disabled",
        unspecifiedText = "Unspecified",
        notAvailableText = "Not available",
        loadingText = "Loading...",
        andText = "and",
        moreText = "more",
        morePluginsText = "more plugins",
        bitsText = "bits",
    } = props

    const [fingerprint, setFingerprint] = useState({
        colorDepth: 0,
        cookiesEnabled: false,
        doNotTrack: "Unknown",
        javaEnabled: false,
        userAgent: loadingText,
        screen: {
            width: 0,
            height: 0,
            availWidth: 0,
            availHeight: 0,
            colorDepth: 0,
            pixelDepth: 0,
        },
        webGL: {
            renderer: loadingText,
            vendor: loadingText,
        },
        fonts: [],
        plugins: [],
    })

    useEffect(() => {
        // Get basic browser information that doesn't require permissions
        const getBasicInfo = () => {
            const basicInfo = {
                colorDepth: window.screen.colorDepth || 0,
                cookiesEnabled: navigator.cookieEnabled,
                doNotTrack: navigator.doNotTrack || "unspecified",
                javaEnabled: navigator.javaEnabled
                    ? navigator.javaEnabled()
                    : false,
                userAgent: navigator.userAgent,
                screen: {
                    width: window.screen.width || 0,
                    height: window.screen.height || 0,
                    availWidth: window.screen.availWidth || 0,
                    availHeight: window.screen.availHeight || 0,
                    colorDepth: window.screen.colorDepth || 0,
                    pixelDepth: window.screen.pixelDepth || 0,
                },
            }
            return basicInfo
        }

        // Get WebGL information
        const getWebGLInfo = () => {
            let webGLInfo = {
                renderer: notAvailableText,
                vendor: notAvailableText,
            }

            try {
                const canvas = document.createElement("canvas")
                const gl =
                    canvas.getContext("webgl") ||
                    canvas.getContext("experimental-webgl")

                if (gl) {
                    const debugInfo = gl.getExtension(
                        "WEBGL_debug_renderer_info"
                    )
                    if (debugInfo) {
                        webGLInfo.renderer =
                            gl.getParameter(
                                debugInfo.UNMASKED_RENDERER_WEBGL
                            ) || notAvailableText
                        webGLInfo.vendor =
                            gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL) ||
                            notAvailableText
                    }
                }
            } catch (e) {
                console.error("Error getting WebGL info:", e)
            }

            return webGLInfo
        }

        // Detect available fonts (simplified approach)
        const detectFonts = () => {
            const commonFonts = [
                "Arial",
                "Arial Black",
                "Arial Narrow",
                "Calibri",
                "Cambria",
                "Cambria Math",
                "Comic Sans MS",
                "Consolas",
                "Courier",
                "Courier New",
                "Georgia",
                "Helvetica",
                "Impact",
                "Lucida Console",
                "Lucida Sans Unicode",
                "Microsoft Sans Serif",
                "Palatino Linotype",
                "Segoe UI",
                "Tahoma",
                "Times",
                "Times New Roman",
                "Trebuchet MS",
                "Verdana",
            ]

            const availableFonts = []
            const testString = "mmmmmmmmmmlli"
            const testSize = "72px"
            const baseFonts = ["monospace", "sans-serif", "serif"]

            const detectFont = (fontName) => {
                const body = document.body

                // Creating spans for font comparison
                const span = document.createElement("span")
                span.innerHTML = testString
                span.style.fontSize = testSize
                span.style.position = "absolute"
                span.style.left = "-10000px"
                span.style.top = "-10000px"

                // Create reference spans for width comparison
                const baseSpans = {}
                baseFonts.forEach((baseFont) => {
                    baseSpans[baseFont] = document.createElement("span")
                    baseSpans[baseFont].innerHTML = testString
                    baseSpans[baseFont].style.fontSize = testSize
                    baseSpans[baseFont].style.position = "absolute"
                    baseSpans[baseFont].style.left = "-10000px"
                    baseSpans[baseFont].style.top = "-10000px"
                    baseSpans[baseFont].style.fontFamily = baseFont
                    body.appendChild(baseSpans[baseFont])
                })

                // Check for specific font
                for (let i = 0; i < baseFonts.length; i++) {
                    const baseFont = baseFonts[i]
                    span.style.fontFamily = `'${fontName}', ${baseFont}`
                    body.appendChild(span)

                    const detected =
                        span.offsetWidth !== baseSpans[baseFont].offsetWidth

                    body.removeChild(span)

                    if (detected) {
                        return true
                    }
                }

                return false
            }

            // Check each font
            commonFonts.forEach((font) => {
                if (detectFont(font)) {
                    availableFonts.push(font)
                }
            })

            // Clean up
            baseFonts.forEach((baseFont) => {
                const span = document.body.querySelector(
                    `span[style*="font-family: ${baseFont}"]`
                )
                if (span) document.body.removeChild(span)
            })

            return availableFonts
        }

        // Get browser plugin information
        const getPlugins = () => {
            const plugins = []
            if (navigator.plugins) {
                for (let i = 0; i < navigator.plugins.length; i++) {
                    const plugin = navigator.plugins[i]
                    plugins.push({
                        name: plugin.name,
                        description: plugin.description,
                    })
                }
            }
            return plugins
        }

        // Combine all fingerprint data
        const collectFingerprint = () => {
            const basicInfo = getBasicInfo()
            const webGLInfo = getWebGLInfo()
            const fonts = showFonts ? detectFonts() : []
            const plugins = showPlugins ? getPlugins() : []

            setFingerprint({
                ...basicInfo,
                webGL: webGLInfo,
                fonts: fonts,
                plugins: plugins,
            })
        }

        collectFingerprint()
    }, [showFonts, showPlugins, loadingText, notAvailableText])

    const getScrollbarBackground = () => {
        if (useGradient) {
            return `linear-gradient(to bottom, ${scrollbarStartColor}, ${scrollbarEndColor})`
        }
        return scrollbarStartColor
    }

    const containerStyle = {
        backgroundColor,
        color: textColor,
        borderRadius: `${cornerRadius}px`,
        padding: useSinglePadding
            ? `${padding}px`
            : `${paddingTop}px ${paddingRight}px ${paddingBottom}px ${paddingLeft}px`,
        fontFamily,
        maxWidth: "100%",
        height: fixedHeight ? `${maxHeight}px` : "auto",
        maxHeight: !fixedHeight && enableScroll ? `${maxHeight}px` : "none",
        overflow: enableScroll
            ? scrollbarStyle === "none"
                ? "hidden"
                : "auto"
            : "visible",
        overflowY:
            enableScroll && scrollbarStyle !== "none"
                ? alwaysShowScrollbar
                    ? "scroll"
                    : "auto"
                : null,
        ...(scrollbarStyle === "thin" && {
            scrollbarWidth: "thin",
            msOverflowStyle: "none",
        }),
        ...(scrollbarStyle === "custom" && {
            overflowY: alwaysShowScrollbar ? "scroll" : "auto",
            scrollbarWidth: "none", // Hide default scrollbar for Firefox
            msOverflowStyle: "none", // Hide default scrollbar for IE/Edge
            "&::-webkit-scrollbar": {
                width: `${scrollbarWidth}px`,
                background: "transparent",
            },
            "&::-webkit-scrollbar-track": {
                background: "transparent",
            },
            "&::-webkit-scrollbar-thumb": {
                background: getScrollbarBackground(),
                borderRadius: `${scrollbarBorderRadius}px`,
                opacity: scrollbarOpacity / 100,
                height: `${scrollbarLength}%`,
            },
        }),
    }

    const titleStyle = {
        fontSize: "18px",
        fontWeight: "bold",
        marginBottom: "16px",
        color: accentColor,
        textAlign: "center",
    }

    const sectionStyle = {
        marginBottom: "20px",
    }

    const sectionTitleStyle = {
        fontSize: "16px",
        fontWeight: "bold",
        marginBottom: "8px",
        color: accentColor,
        borderBottom: `1px solid ${accentColor}`,
        paddingBottom: "4px",
    }

    const infoItemStyle = {
        display: "flex",
        justifyContent: "space-between",
        marginBottom: "6px",
        fontSize: `${fontSize}px`,
    }

    const keyStyle = {
        fontWeight: "500",
    }

    const valueStyle = {
        textAlign: "right",
    }

    const formatDoNotTrack = (dnt) => {
        if (dnt === "1" || dnt === "yes") return enabledText
        if (dnt === "0" || dnt === "no") return disabledText
        return unspecifiedText
    }

    return (
        <div style={containerStyle}>
            {showTitle && <div style={titleStyle}>{title}</div>}

            <div style={sectionStyle}>
                <div style={sectionTitleStyle}>{basicInfoTitle}</div>

                {showColorDepth && (
                    <div style={infoItemStyle}>
                        <span style={keyStyle}>{colorDepthLabel}</span>
                        <span style={valueStyle}>
                            {fingerprint.colorDepth} {bitsText}
                        </span>
                    </div>
                )}

                {showCookiesEnabled && (
                    <div style={infoItemStyle}>
                        <span style={keyStyle}>{cookiesEnabledLabel}</span>
                        <span style={valueStyle}>
                            {fingerprint.cookiesEnabled ? yesText : noText}
                        </span>
                    </div>
                )}

                {showDoNotTrack && (
                    <div style={infoItemStyle}>
                        <span style={keyStyle}>{doNotTrackLabel}</span>
                        <span style={valueStyle}>
                            {formatDoNotTrack(fingerprint.doNotTrack)}
                        </span>
                    </div>
                )}

                {showJavaEnabled && (
                    <div style={infoItemStyle}>
                        <span style={keyStyle}>{javaEnabledLabel}</span>
                        <span style={valueStyle}>
                            {fingerprint.javaEnabled ? yesText : noText}
                        </span>
                    </div>
                )}
            </div>

            {showScreenDetails && (
                <div style={sectionStyle}>
                    <div style={sectionTitleStyle}>{screenDetailsTitle}</div>
                    <div style={infoItemStyle}>
                        <span style={keyStyle}>{screenResolutionLabel}</span>
                        <span style={valueStyle}>
                            {fingerprint.screen.width} x{" "}
                            {fingerprint.screen.height}
                        </span>
                    </div>
                    <div style={infoItemStyle}>
                        <span style={keyStyle}>{availableResolutionLabel}</span>
                        <span style={valueStyle}>
                            {fingerprint.screen.availWidth} x{" "}
                            {fingerprint.screen.availHeight}
                        </span>
                    </div>
                    <div style={infoItemStyle}>
                        <span style={keyStyle}>{colorDepthScreenLabel}</span>
                        <span style={valueStyle}>
                            {fingerprint.screen.colorDepth} {bitsText}
                        </span>
                    </div>
                    <div style={infoItemStyle}>
                        <span style={keyStyle}>{pixelDepthLabel}</span>
                        <span style={valueStyle}>
                            {fingerprint.screen.pixelDepth} {bitsText}
                        </span>
                    </div>
                </div>
            )}

            {showWebGLInfo && (
                <div style={sectionStyle}>
                    <div style={sectionTitleStyle}>{webGLInfoTitle}</div>
                    <div style={infoItemStyle}>
                        <span style={keyStyle}>{rendererLabel}</span>
                        <span style={valueStyle}>
                            {fingerprint.webGL.renderer}
                        </span>
                    </div>
                    <div style={infoItemStyle}>
                        <span style={keyStyle}>{vendorLabel}</span>
                        <span style={valueStyle}>
                            {fingerprint.webGL.vendor}
                        </span>
                    </div>
                </div>
            )}

            {showUserAgent && (
                <div style={sectionStyle}>
                    <div style={sectionTitleStyle}>{userAgentTitle}</div>
                    <div style={{ ...infoItemStyle, flexDirection: "column" }}>
                        <span
                            style={{
                                ...valueStyle,
                                textAlign: "left",
                                wordBreak: "break-word",
                            }}
                        >
                            {fingerprint.userAgent}
                        </span>
                    </div>
                </div>
            )}

            {showFonts && fingerprint.fonts.length > 0 && (
                <div style={sectionStyle}>
                    <div style={sectionTitleStyle}>{detectedFontsTitle}</div>
                    <div style={{ ...infoItemStyle, flexDirection: "column" }}>
                        <span style={{ textAlign: "left" }}>
                            {fingerprint.fonts.slice(0, maxFonts).join(", ")}
                            {fingerprint.fonts.length > maxFonts
                                ? ` ${andText} ${fingerprint.fonts.length - maxFonts} ${moreText}...`
                                : ""}
                        </span>
                    </div>
                </div>
            )}

            {showPlugins && fingerprint.plugins.length > 0 && (
                <div style={sectionStyle}>
                    <div style={sectionTitleStyle}>{browserPluginsTitle}</div>
                    {fingerprint.plugins
                        .slice(0, maxPlugins)
                        .map((plugin, index) => (
                            <div key={index} style={{ marginBottom: "6px" }}>
                                <div style={{ fontWeight: "500" }}>
                                    {plugin.name}
                                </div>
                                <div
                                    style={{
                                        fontSize: `${fontSize - 2}px`,
                                        color: `${textColor}99`,
                                    }}
                                >
                                    {plugin.description}
                                </div>
                            </div>
                        ))}
                    {fingerprint.plugins.length > maxPlugins && (
                        <div
                            style={{
                                fontSize: `${fontSize - 1}px`,
                                fontStyle: "italic",
                            }}
                        >
                            ...{andText}{" "}
                            {fingerprint.plugins.length - maxPlugins}{" "}
                            {morePluginsText}
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}

// Add property controls for customization in Framer
addPropertyControls(CustomizableBrowserFingerprint, {
    // Content Display
    showColorDepth: {
        type: ControlType.Boolean,
        title: "Color Depth",
        defaultValue: true,
        groupTitle: "Content Display",
        group: "content",
    },
    showCookiesEnabled: {
        type: ControlType.Boolean,
        title: "Cookies Enabled",
        defaultValue: true,
        group: "content",
    },
    showDoNotTrack: {
        type: ControlType.Boolean,
        title: "Do Not Track",
        defaultValue: true,
        group: "content",
    },
    showJavaEnabled: {
        type: ControlType.Boolean,
        title: "Java Enabled",
        defaultValue: true,
        group: "content",
    },
    showUserAgent: {
        type: ControlType.Boolean,
        title: "User Agent",
        defaultValue: true,
        group: "content",
    },
    showScreenDetails: {
        type: ControlType.Boolean,
        title: "Screen Details",
        defaultValue: true,
        group: "content",
    },
    showWebGLInfo: {
        type: ControlType.Boolean,
        title: "WebGL Info",
        defaultValue: true,
        group: "content",
    },
    showFonts: {
        type: ControlType.Boolean,
        title: "Installed Fonts",
        defaultValue: true,
        group: "content",
    },
    showPlugins: {
        type: ControlType.Boolean,
        title: "Browser Plugins",
        defaultValue: false,
        group: "content",
    },

    // Content Configuration
    maxFonts: {
        type: ControlType.Number,
        title: "Max Fonts to Show",
        defaultValue: 5,
        min: 1,
        max: 20,
        step: 1,
        hidden: (props) => !props.showFonts,
        groupTitle: "Content Configuration",
        group: "contentConfig",
    },
    maxPlugins: {
        type: ControlType.Number,
        title: "Max Plugins to Show",
        defaultValue: 5,
        min: 1,
        max: 20,
        step: 1,
        hidden: (props) => !props.showPlugins,
        group: "contentConfig",
    },

    // Appearance
    backgroundColor: {
        type: ControlType.Color,
        title: "Background Color",
        defaultValue: "#f5f5f5",
        groupTitle: "Appearance",
        group: "appearance",
    },
    textColor: {
        type: ControlType.Color,
        title: "Text Color",
        defaultValue: "#333333",
        group: "appearance",
    },
    accentColor: {
        type: ControlType.Color,
        title: "Accent Color",
        defaultValue: "#0066cc",
        group: "appearance",
    },
    fontSize: {
        type: ControlType.Number,
        title: "Font Size",
        defaultValue: 14,
        min: 10,
        max: 24,
        step: 1,
        group: "appearance",
    },
    fontFamily: {
        type: ControlType.String,
        title: "Font Family",
        defaultValue: "Arial, sans-serif",
        placeholder: "e.g., Roboto, Arial, sans-serif",
        group: "appearance",
    },
    cornerRadius: {
        type: ControlType.Number,
        title: "Corner Radius",
        defaultValue: 8,
        min: 0,
        max: 50,
        step: 1,
        group: "appearance",
    },
    padding: {
        type: ControlType.Number,
        title: "Padding",
        defaultValue: 16,
        min: 0,
        max: 50,
        step: 1,
        group: "appearance",
    },
    showTitle: {
        type: ControlType.Boolean,
        title: "Show Title",
        defaultValue: true,
        group: "appearance",
    },

    // Size and Scroll Controls
    fixedHeight: {
        type: ControlType.Boolean,
        title: "Fixed Height",
        defaultValue: false,
        groupTitle: "Size & Scroll",
        group: "sizeScroll",
    },
    maxHeight: {
        type: ControlType.Number,
        title: "Max Height (px)",
        defaultValue: 500,
        min: 100,
        max: 2000,
        step: 10,
        group: "sizeScroll",
    },
    enableScroll: {
        type: ControlType.Boolean,
        title: "Enable Scrolling",
        defaultValue: true,
        group: "sizeScroll",
    },
    scrollbarStyle: {
        type: ControlType.Enum,
        title: "Scrollbar Style",
        options: ["auto", "thin", "none", "custom"],
        optionTitles: ["Auto", "Thin", "Hidden", "Custom"],
        defaultValue: "auto",
        group: "sizeScroll",
        hidden: (props) => !props.enableScroll,
    },
    alwaysShowScrollbar: {
        type: ControlType.Boolean,
        title: "Always Show Scrollbar",
        defaultValue: false,
        group: "sizeScroll",
        hidden: (props) =>
            !props.enableScroll || props.scrollbarStyle === "none",
    },
    scrollbarWidth: {
        type: ControlType.Number,
        title: "Scrollbar Width (px)",
        defaultValue: 8,
        min: 2,
        max: 20,
        step: 1,
        group: "sizeScroll",
        hidden: (props) =>
            !props.enableScroll || props.scrollbarStyle !== "custom",
    },
    scrollbarLength: {
        type: ControlType.Number,
        title: "Scrollbar Length (%)",
        defaultValue: 100,
        min: 10,
        max: 100,
        step: 5,
        group: "sizeScroll",
        hidden: (props) =>
            !props.enableScroll || props.scrollbarStyle !== "custom",
    },
    scrollbarBorderRadius: {
        type: ControlType.Number,
        title: "Scrollbar Corner Radius",
        defaultValue: 4,
        min: 0,
        max: 20,
        step: 1,
        group: "sizeScroll",
        hidden: (props) =>
            !props.enableScroll || props.scrollbarStyle !== "custom",
    },
    useGradient: {
        type: ControlType.Boolean,
        title: "Use Gradient",
        defaultValue: false,
        group: "sizeScroll",
        hidden: (props) =>
            !props.enableScroll || props.scrollbarStyle !== "custom",
    },
    scrollbarStartColor: {
        type: ControlType.Color,
        title: (props) =>
            props.useGradient ? "Start Color" : "Scrollbar Color",
        defaultValue: "#bbbbbb",
        group: "sizeScroll",
        hidden: (props) =>
            !props.enableScroll || props.scrollbarStyle !== "custom",
    },
    scrollbarEndColor: {
        type: ControlType.Color,
        title: "End Color",
        defaultValue: "#999999",
        group: "sizeScroll",
        hidden: (props) =>
            !props.enableScroll ||
            props.scrollbarStyle !== "custom" ||
            !props.useGradient,
    },
    scrollbarOpacity: {
        type: ControlType.Number,
        title: "Scrollbar Opacity (%)",
        defaultValue: 100,
        min: 0,
        max: 100,
        step: 5,
        group: "sizeScroll",
        hidden: (props) =>
            !props.enableScroll || props.scrollbarStyle !== "custom",
    },

    // Section Titles
    title: {
        type: ControlType.String,
        title: "Main Title",
        defaultValue: "Browser Fingerprint Information",
        hidden: (props) => !props.showTitle,
        groupTitle: "Section Titles",
        group: "titles",
    },
    basicInfoTitle: {
        type: ControlType.String,
        title: "Basic Info Section",
        defaultValue: "Basic Information",
        group: "titles",
    },
    screenDetailsTitle: {
        type: ControlType.String,
        title: "Screen Details Section",
        defaultValue: "Screen Details",
        hidden: (props) => !props.showScreenDetails,
        group: "titles",
    },
    webGLInfoTitle: {
        type: ControlType.String,
        title: "WebGL Info Section",
        defaultValue: "WebGL Information",
        hidden: (props) => !props.showWebGLInfo,
        group: "titles",
    },
    userAgentTitle: {
        type: ControlType.String,
        title: "User Agent Section",
        defaultValue: "User Agent",
        hidden: (props) => !props.showUserAgent,
        group: "titles",
    },
    detectedFontsTitle: {
        type: ControlType.String,
        title: "Fonts Section",
        defaultValue: "Detected Fonts",
        hidden: (props) => !props.showFonts,
        group: "titles",
    },
    browserPluginsTitle: {
        type: ControlType.String,
        title: "Plugins Section",
        defaultValue: "Browser Plugins",
        hidden: (props) => !props.showPlugins,
        group: "titles",
    },

    // Basic Info Labels
    colorDepthLabel: {
        type: ControlType.String,
        title: "Color Depth Label",
        defaultValue: "Color Depth:",
        hidden: (props) => !props.showColorDepth,
        groupTitle: "Basic Info Labels",
        group: "basicLabels",
    },
    cookiesEnabledLabel: {
        type: ControlType.String,
        title: "Cookies Enabled Label",
        defaultValue: "Cookies Enabled:",
        hidden: (props) => !props.showCookiesEnabled,
        group: "basicLabels",
    },
    doNotTrackLabel: {
        type: ControlType.String,
        title: "Do Not Track Label",
        defaultValue: "Do Not Track:",
        hidden: (props) => !props.showDoNotTrack,
        group: "basicLabels",
    },
    javaEnabledLabel: {
        type: ControlType.String,
        title: "Java Enabled Label",
        defaultValue: "Java Enabled:",
        hidden: (props) => !props.showJavaEnabled,
        group: "basicLabels",
    },

    // Screen Details Labels
    screenResolutionLabel: {
        type: ControlType.String,
        title: "Screen Resolution Label",
        defaultValue: "Screen Resolution:",
        hidden: (props) => !props.showScreenDetails,
        groupTitle: "Screen Details Labels",
        group: "screenLabels",
    },
    availableResolutionLabel: {
        type: ControlType.String,
        title: "Available Resolution Label",
        defaultValue: "Available Resolution:",
        hidden: (props) => !props.showScreenDetails,
        group: "screenLabels",
    },
    colorDepthScreenLabel: {
        type: ControlType.String,
        title: "Color Depth Label",
        defaultValue: "Color Depth:",
        hidden: (props) => !props.showScreenDetails,
        group: "screenLabels",
    },
    pixelDepthLabel: {
        type: ControlType.String,
        title: "Pixel Depth Label",
        defaultValue: "Pixel Depth:",
        hidden: (props) => !props.showScreenDetails,
        group: "screenLabels",
    },

    // WebGL Labels
    rendererLabel: {
        type: ControlType.String,
        title: "Renderer Label",
        defaultValue: "Renderer:",
        hidden: (props) => !props.showWebGLInfo,
        groupTitle: "WebGL Labels",
        group: "webglLabels",
    },
    vendorLabel: {
        type: ControlType.String,
        title: "Vendor Label",
        defaultValue: "Vendor:",
        hidden: (props) => !props.showWebGLInfo,
        group: "webglLabels",
    },

    // Status messages
    yesText: {
        type: ControlType.String,
        title: "Yes Text",
        defaultValue: "Yes",
        groupTitle: "Status Messages",
        group: "statusMessages",
    },
    noText: {
        type: ControlType.String,
        title: "No Text",
        defaultValue: "No",
        group: "statusMessages",
    },
    enabledText: {
        type: ControlType.String,
        title: "Enabled Text",
        defaultValue: "Enabled",
        group: "statusMessages",
    },
    disabledText: {
        type: ControlType.String,
        title: "Disabled Text",
        defaultValue: "Disabled",
        group: "statusMessages",
    },
    unspecifiedText: {
        type: ControlType.String,
        title: "Unspecified Text",
        defaultValue: "Unspecified",
        group: "statusMessages",
    },
    notAvailableText: {
        type: ControlType.String,
        title: "Not Available Text",
        defaultValue: "Not available",
        group: "statusMessages",
    },
    loadingText: {
        type: ControlType.String,
        title: "Loading Text",
        defaultValue: "Loading...",
        group: "statusMessages",
    },
    andText: {
        type: ControlType.String,
        title: "And Text",
        defaultValue: "and",
        group: "statusMessages",
    },
    moreText: {
        type: ControlType.String,
        title: "More Text",
        defaultValue: "more",
        group: "statusMessages",
    },
    morePluginsText: {
        type: ControlType.String,
        title: "More Plugins Text",
        defaultValue: "more plugins",
        hidden: (props) => !props.showPlugins,
        group: "statusMessages",
    },
    bitsText: {
        type: ControlType.String,
        title: "Bits Text",
        defaultValue: "bits",
        group: "statusMessages",
    },
})
