export interface AppIconSources {
  playStore: string;
  apkPure: string;
  iconFinder: string;
  fallback: string;
}

export class AppIconService {
  private static readonly ICON_CACHE = new Map<string, string>();
  private static readonly DEBUG_MODE = true;

  private static log(message: string) {
    if (this.DEBUG_MODE) {
      console.log(message);
    }
  }

  static getIconSources(packageName: string): AppIconSources {
    return {
      playStore: `https://play-lh.googleusercontent.com/apps/${packageName}/icon-128.png`,

      apkPure: `https://image.winudf.com/v2/image1/${packageName}/icon.png?fakeurl=1&type=.png`,

      iconFinder: `https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/${packageName.split(".").pop()}.svg`,

      fallback:
        "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDgiIGhlaWdodD0iNDgiIHZpZXdCb3g9IjAgMCA0OCA0OCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQ4IiBoZWlnaHQ9IjQ4IiByeD0iMTIiIGZpbGw9IiM0Rjc5QTQiLz4KPHN2ZyB4PSIxMiIgeT0iMTIiIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPgo8cGF0aCBkPSJNMTIgMkw4IDZINFYyMEg4TDEyIDI0TDE2IDIwSDIwVjZIMTZMMTIgMloiIGZpbGw9IndoaXRlIi8+Cjwvc3ZnPgo8L3N2Zz4K",
    };
  }

  static async fetchAppIcon(packageName: string): Promise<string> {
    if (this.ICON_CACHE.has(packageName)) {
      return this.ICON_CACHE.get(packageName)!;
    }

    const iconSources = [
      `https://play-lh.googleusercontent.com/apps/${packageName}/icon-128.png`,

      `https://lh3.googleusercontent.com/a-/${packageName}=s128-c`,

      `https://image.winudf.com/v2/image1/${packageName}/icon.png?fakeurl=1&type=.png`,

      `https://apkpure.com/images/app_icon/${packageName}.png`,

      `https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/${packageName.split(".").pop()}.svg`,
    ];

    for (const url of iconSources) {
      try {
        const isValidIcon = await this.validateIconUrl(url);
        if (isValidIcon) {
          console.log(`✅ Found icon for ${packageName} at: ${url}`);
          this.ICON_CACHE.set(packageName, url);
          return url;
        }
      } catch (error) {
        console.warn(`Failed to fetch icon from ${url} for ${packageName}`);
      }
    }

    const sources = this.getIconSources(packageName);
    console.log(`⚠️ Using fallback icon for ${packageName}`);
    this.ICON_CACHE.set(packageName, sources.fallback);
    return sources.fallback;
  }

  private static async validateIconUrl(url: string): Promise<boolean> {
    return new Promise((resolve) => {
      const img = new Image();

      const timeout = setTimeout(() => {
        img.src = "";
        resolve(false);
      }, 5000);

      img.onload = () => {
        clearTimeout(timeout);

        if (img.width > 0 && img.height > 0) {
          resolve(true);
        } else {
          resolve(false);
        }
      };

      img.onerror = () => {
        clearTimeout(timeout);
        resolve(false);
      };

      img.src = url;
    });
  }

  static getKnownAppIcon(packageName: string): string | null {
    const knownIcons: Record<string, string> = {
      "com.android.chrome":
        "https://upload.wikimedia.org/wikipedia/commons/e/e1/Google_Chrome_icon_%28February_2022%29.svg",
      "com.google.android.youtube":
        "https://upload.wikimedia.org/wikipedia/commons/0/09/YouTube_full-color_icon_%282017%29.svg",
      "com.google.android.gm":
        "https://upload.wikimedia.org/wikipedia/commons/7/7e/Gmail_icon_%282020%29.svg",
      "com.google.android.apps.maps":
        "https://upload.wikimedia.org/wikipedia/commons/b/bd/Google_Maps_Logo_2020.svg",
      "com.google.android.googlequicksearchbox":
        "https://upload.wikimedia.org/wikipedia/commons/5/53/Google_%22G%22_Logo.svg",
      "com.google.android.apps.youtube.music":
        "https://upload.wikimedia.org/wikipedia/commons/6/6a/Youtube_Music_icon.svg",

      "com.samsung.android.dialer":
        "https://img.icons8.com/fluency/48/phone.png",
      "com.samsung.android.messaging":
        "https://img.icons8.com/fluency/48/speech-bubble.png",
      "com.samsung.android.gallery":
        "https://img.icons8.com/fluency/48/image.png",
      "com.sec.android.gallery3d":
        "https://img.icons8.com/fluency/48/image.png",
      "com.samsung.android.calendar":
        "https://img.icons8.com/fluency/48/calendar.png",
      "com.samsung.android.app.contacts":
        "https://img.icons8.com/fluency/48/contacts.png",
      "com.sec.android.app.camera":
        "https://img.icons8.com/fluency/48/camera.png",
      "com.sec.android.app.clockpackage":
        "https://img.icons8.com/fluency/48/clock.png",
      "com.samsung.android.app.notes":
        "https://img.icons8.com/fluency/48/note.png",
      "com.sec.android.app.popupcalculator":
        "https://img.icons8.com/fluency/48/calculator.png",

      "com.android.settings": "https://img.icons8.com/fluency/48/settings.png",
      "com.android.vending":
        "https://img.icons8.com/fluency/48/google-play.png",
      "com.android.browser": "https://img.icons8.com/fluency/48/internet.png",
      "com.android.calculator2":
        "https://img.icons8.com/fluency/48/calculator.png",

      "com.whatsapp": "https://img.icons8.com/color/48/whatsapp.png",
      "com.facebook.katana":
        "https://img.icons8.com/fluency/48/facebook-new.png",
      "com.facebook.orca":
        "https://img.icons8.com/color/48/facebook-messenger.png",
      "com.instagram.android":
        "https://img.icons8.com/fluency/48/instagram-new.png",
      "com.snapchat.android": "https://img.icons8.com/fluency/48/snapchat.png",
      "com.twitter.android": "https://img.icons8.com/color/48/twitter.png",
      "com.zhiliaoapp.musically": "https://img.icons8.com/color/48/tiktok.png",
      "com.linkedin.android": "https://img.icons8.com/color/48/linkedin.png",

      "com.spotify.music": "https://img.icons8.com/fluency/48/spotify.png",
      "com.netflix.mediaclient": "https://img.icons8.com/color/48/netflix.png",
      "com.amazon.kindle": "https://img.icons8.com/color/48/kindle.png",

      "com.microsoft.office.outlook":
        "https://img.icons8.com/fluency/48/microsoft-outlook-2019.png",
      "com.microsoft.skydrive":
        "https://img.icons8.com/fluency/48/onedrive.png",
      "com.dropbox.android": "https://img.icons8.com/color/48/dropbox.png",
      "com.evernote": "https://img.icons8.com/color/48/evernote.png",

      "com.amazon.mShop.android.shopping":
        "https://img.icons8.com/color/48/amazon.png",
      "com.ebay.mobile": "https://img.icons8.com/color/48/ebay.png",
      "com.einnovation.temu":
        "https://img.icons8.com/color/48/shopping-cart.png",
      "com.zzkko": "https://img.icons8.com/color/48/clothes.png",

      "com.duolingo": "https://img.icons8.com/color/48/duolingo.png",
      "com.khanacademy.android":
        "https://img.icons8.com/color/48/khan-academy.png",

      "com.skype.raider": "https://img.icons8.com/color/48/skype.png",
      "com.viber.voip": "https://img.icons8.com/color/48/viber.png",
      "org.telegram.messenger":
        "https://img.icons8.com/color/48/telegram-app.png",
      "com.discord": "https://img.icons8.com/color/48/discord-logo.png",

      "com.paypal.android.p2pmobile":
        "https://img.icons8.com/color/48/paypal.png",
      "com.square.cash": "https://img.icons8.com/color/48/cash-app.png",
    };

    return knownIcons[packageName] || null;
  }

  static async getBestAppIcon(packageName: string): Promise<string> {
    this.log(`🔍 Fetching icon for: ${packageName}`);

    const knownIcon = this.getKnownAppIcon(packageName);
    if (knownIcon) {
      this.log(`✅ Using known icon for ${packageName}: ${knownIcon}`);
      this.ICON_CACHE.set(packageName, knownIcon);
      return knownIcon;
    }

    try {
      this.log(`🌐 Fetching from external sources for ${packageName}`);
      const result = await Promise.race([
        this.fetchAppIcon(packageName),
        new Promise<string>((_, reject) =>
          setTimeout(() => reject(new Error("Timeout")), 10000),
        ),
      ]);
      this.log(`📦 Result for ${packageName}: ${result.substring(0, 100)}...`);
      return result;
    } catch (error) {
      this.log(`❌ Failed to fetch icon for ${packageName}, using fallback`);
      const fallback = this.getIconSources(packageName).fallback;
      this.ICON_CACHE.set(packageName, fallback);
      return fallback;
    }
  }

  static async preloadIcons(packageNames: string[]): Promise<void> {
    const promises = packageNames.map((packageName) =>
      this.getBestAppIcon(packageName).catch(() => {}),
    );

    await Promise.allSettled(promises);
  }

  static clearCache(): void {
    this.ICON_CACHE.clear();
  }

  static getCacheSize(): number {
    return this.ICON_CACHE.size;
  }
}
