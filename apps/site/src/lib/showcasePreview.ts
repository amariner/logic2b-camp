const bodyStyleKeys = [
  'position',
  'top',
  'right',
  'left',
  'width',
  'overflow',
  'paddingRight',
] as const;

type BodyStyleKey = (typeof bodyStyleKeys)[number];

let lockedScrollY: number | null = null;
let previousBodyStyles: Record<BodyStyleKey, string> | null = null;

const hasOpenShowcasePreview = () =>
  Boolean(
    document.querySelector('[data-theme-preview-dialog][open], [data-management-dialog][open]'),
  );

const lockShowcaseScroll = () => {
  if (lockedScrollY !== null) return;

  const root = document.documentElement;
  const body = document.body;
  lockedScrollY = window.scrollY;
  previousBodyStyles = Object.fromEntries(
    bodyStyleKeys.map((key) => [key, body.style[key]]),
  ) as Record<BodyStyleKey, string>;

  const scrollbarWidth = Math.max(0, window.innerWidth - root.clientWidth);
  root.classList.add('showcase-preview-open');
  body.style.position = 'fixed';
  body.style.top = `-${lockedScrollY}px`;
  body.style.right = '0';
  body.style.left = '0';
  body.style.width = '100%';
  body.style.overflow = 'hidden';
  if (scrollbarWidth > 0) body.style.paddingRight = `${scrollbarWidth}px`;
};

const unlockShowcaseScroll = () => {
  if (lockedScrollY === null || !previousBodyStyles) return;

  const root = document.documentElement;
  const body = document.body;
  const scrollY = lockedScrollY;
  const previousScrollBehavior = root.style.scrollBehavior;

  bodyStyleKeys.forEach((key) => {
    body.style[key] = previousBodyStyles?.[key] ?? '';
  });
  root.classList.remove('showcase-preview-open');
  root.style.scrollBehavior = 'auto';
  window.scrollTo(0, scrollY);
  root.style.scrollBehavior = previousScrollBehavior;

  lockedScrollY = null;
  previousBodyStyles = null;
};

export const syncShowcasePreviewScroll = () => {
  if (hasOpenShowcasePreview()) lockShowcaseScroll();
  else unlockShowcaseScroll();
};
