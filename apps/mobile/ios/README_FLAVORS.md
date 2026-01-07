# iOS Flavor Configuration Guide

Since the Xcode project file (`project.pbxproj`) cannot be safely modified via simple text editing, follow these manual steps to complete the flavor configuration for iOS.

## 1. Create Configurations
1. Open `ios/Runner.xcworkspace` in Xcode.
2. Go to **Project Runner** -> **Info** tab -> **Configurations**.
3. Duplicate `Debug` configuration into `Debug-dev`, `Debug-staging`, `Debug-prod`.
4. Duplicate `Release` configuration into `Release-dev`, `Release-staging`, `Release-prod`.
5. Duplicate `Profile` configuration into `Profile-dev`, `Profile-staging`, `Profile-prod`.

## 2. Link xcconfig Files
1. Expand the **Configurations** section.
2. For each configuration, set the configuration file (based on `ios/Flutter/*.xcconfig`):
   - `Debug-dev` -> `dev.xcconfig`
   - `Release-dev` -> `dev.xcconfig`
   - ... and so on.

## 3. Create Schemes
1. Manage Schemes -> Create new schemes: `dev`, `staging`, `prod`.
2. Edit each scheme:
   - **Run**: Build Configuration -> `Debug-dev` (for dev scheme).
   - **Archive**: Build Configuration -> `Release-dev`.
   - **Profile**: Build Configuration -> `Profile-dev`.

## 4. Update Info.plist
Update `Bundle display name` to `$(BUNDLE_DISPLAY_NAME)` and `Bundle identifier` suffix if needed (managed via `PRODUCT_BUNDLE_IDENTIFIER` in Build Settings).
