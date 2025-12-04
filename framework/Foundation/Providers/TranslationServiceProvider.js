/**
 * TranslationServiceProvider
 * Register Translation service
 */

import { Translator } from '../../Translation/Translator.js';

export class TranslationServiceProvider {
  constructor(app) {
    this.app = app;
  }

  register() {
    this.app.singleton('translator', (app) => {
      const config = app.make('config');
      const locale = config.get('translation.locale', 'en');
      const fallback = config.get('translation.fallback_locale', 'en');
      const translationPath = config.get('translation.path');

      const translator = new Translator(locale, fallback);

      if (translationPath) {
        translator.addPath(translationPath);
      }

      return translator;
    });

    this.app.alias('translator', 'Translator');
  }

  boot() {
    // Boot logic if needed
  }
}

export default TranslationServiceProvider;
