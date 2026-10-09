import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Download, X } from 'lucide-react';
import Button from './Button';
import styles from './InstallBanner.module.css';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const DISMISS_KEY = 'pwa-dismissed-until';

export default function InstallBanner() {
  const [prompt, setPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const until = Number(localStorage.getItem(DISMISS_KEY) ?? 0);
    if (Date.now() < until) return;

    const onPrompt = (e: Event) => {
      e.preventDefault();
      setPrompt(e as BeforeInstallPromptEvent);
      setTimeout(() => setVisible(true), 4000);
    };
    const onInstalled = () => setVisible(false);

    window.addEventListener('beforeinstallprompt', onPrompt);
    window.addEventListener('appinstalled', onInstalled);
    return () => {
      window.removeEventListener('beforeinstallprompt', onPrompt);
      window.removeEventListener('appinstalled', onInstalled);
    };
  }, []);

  const install = async () => {
    if (!prompt) return;
    await prompt.prompt();
    await prompt.userChoice;
    setVisible(false);
  };

  const dismiss = () => {
    localStorage.setItem(DISMISS_KEY, String(Date.now() + 30 * 86_400_000));
    setVisible(false);
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className={styles.banner}
          initial={{ opacity: 0, y: 60 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 60 }}
          transition={{ type: 'spring', stiffness: 320, damping: 32 }}
        >
          <div className={styles.text}>
            <p className={styles.title}>Установить Accountant</p>
            <p className={styles.sub}>Работает офлайн и открывается как приложение</p>
          </div>
          <Button size="sm" variant="ghost" onClick={dismiss} icon={<X size={14} />}>Позже</Button>
          <Button size="sm" variant="bone" onClick={install} icon={<Download size={14} />}>Установить</Button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}