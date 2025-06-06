import * as React from 'react';
import createCache, { Options as EmotionCacheOptions } from '@emotion/cache';
import { CacheProvider } from '@emotion/react';
import { useServerInsertedHTML } from 'next/navigation';

type NextAppDirEmotionCacheProviderProps = {
  children: React.ReactNode;
  options?: EmotionCacheOptions;
};

export default function NextAppDirEmotionCacheProvider({ children, options }: NextAppDirEmotionCacheProviderProps) {
  const cache = React.useMemo(() => createCache({ key: 'mui', prepend: true, ...(options || {}) }), [options]);
  return <CacheProvider value={cache}>{children}</CacheProvider>;

  const [registry] = React.useState(() => {
    const cache = createCache({ key: 'mui', prepend: true, ...(options || {}) });
    cache.compat = true;
    const prevInsert = cache.insert;
    let inserted: string[] = [];
    cache.insert = (...args) => {
      const serialized = args[1];
      if (cache.inserted[serialized.name] === undefined) {
        inserted.push(serialized.name);
      }
      return prevInsert(...args);
    };
    const flush = () => {
      const prevInserted = inserted;
      inserted = [];
      return prevInserted;
    };
    return { cache, flush };
  });

  useServerInsertedHTML(() => {
    const names = registry.flush();
    if (names.length === 0) {
      return null;
    }
    let styles = "";
    for (const name of names) {
      styles += registry.cache.inserted[name];
    }
    return (
      <style
        key={registry.cache.key}
        data-emotion={`${registry.cache.key} ${names.join(" ")}`}
        dangerouslySetInnerHTML={{
          __html: styles,
        }}
      />
    );
  });

  return <CacheProvider value={registry.cache}>{children}</CacheProvider>;
}

