'use strict';
/**
 * 内置手册的「故障 → 教程章节」映射（纯函数，不依赖 electron / fs）
 *
 * 0.6.2：手册随应用分发（src/ui/manual.html）。主进程打开手册时只接受
 * 这里给出的锚点，避免渲染层把任意 file:// 路径传进来。
 *
 * 同一个故障可能有多个入口：自动检测的问题 code、安装失败的原始报错、
 * 用户手点的「教程」按钮。三路都汇到 resolve()，保证落到同一节。
 */

const anchors = require('../i18n/manual-anchors.json');
const i18n = require('../i18n');

/** 章节 id 与 src/ui/manual.html 的锚点一一对应（由 docs/build-manual-html.py 生成） */
// anchor 改用 manual-anchors.json 里的 ASCII 稳定 id，中文/法文两份 HTML 共用；
// title 保留中文作为兜底（fr 的 titleFr 为空时回退到这里）。
const TOPICS = Object.freeze({
  overview: { id: 'overview', anchor: anchors.overview.anchor, title: anchors.overview.titleZh },
  accel: { id: 'accel', anchor: anchors.accel.anchor, title: anchors.accel.titleZh },
  install: { id: 'install', anchor: anchors.install.anchor, title: anchors.install.titleZh },
  arm: { id: 'arm', anchor: anchors.arm.anchor, title: anchors.arm.titleZh },
  adb: { id: 'adb', anchor: anchors.adb.anchor, title: anchors.adb.titleZh },
  startup: { id: 'startup', anchor: anchors.startup.anchor, title: anchors.startup.titleZh },
  other: { id: 'other', anchor: anchors.other.anchor, title: anchors.other.titleZh },
  sound: { id: 'sound', anchor: anchors.sound.anchor, title: anchors.sound.titleZh },
  diagnose: { id: 'diagnose', anchor: anchors.diagnose.anchor, title: anchors.diagnose.titleZh },
  settings: { id: 'settings', anchor: anchors.settings.anchor, title: anchors.settings.titleZh },
  storage: { id: 'storage', anchor: anchors.storage.anchor, title: anchors.storage.titleZh },
  network: { id: 'network', anchor: anchors.network.anchor, title: anchors.network.titleZh },
});

// 法语关键词与中文/英文关键词并存：引擎报错本身多为英文，但用户手点的
// 标题/详情可能是中文或法语，三语都要能命中同一个章节。
const ARM_RE = /NO_MATCHING_ABIS|DoBadTrampoline|libndk_translation|UnsatisfiedLinkError|arm64-v8a|armeabi-v7a|ARM 翻译层|ARM 转译层|translation ARM|traduction ARM|couche (de )?traduction ARM|ARM 应用|application ARM/i;
const ADB_RE = /ADB_UNAUTHORIZED|unauthorized|允许 USB 调试|调试授权|autorisation USB|autoriser le débogage USB|débogage USB|non autorisé|appareil non autorisé/i;
const SOUND_RE = /audio|AUDIO|sound|声音|音量|静音|Audiosrv|\bson\b|silencieux|\bvolume\b|coupé le son|pas de son/i;

/** 自动检测的问题 code → 章节 id */
const ISSUE_MAP = Object.freeze({
  'accel.softwareEmulation': 'accel',
  'device.unauthorized': 'adb',
  'device.offline': 'adb',
  'device.missing': 'adb',
  'settings.orientationConflict': 'startup',
  'settings.detachedFullscreen': 'startup',
  'settings.snapshotOffLowDisk': 'storage',
  'storage.sharedBroken': 'storage',
  'settings.audioDisabled': 'sound',
  'audio.disabled': 'sound',
  'audio.windowsServiceStopped': 'sound',
  'storage.diskCritical': 'storage',
  'storage.diskLow': 'storage',
  'storage.dataNeedsReset': 'storage',
  'storage.dataMismatch': 'storage',
  'network.guestDown': 'network',
  'network.sourcesDown': 'network',
  'runtime.staleLocks': 'startup',
  'runtime.orphanProcesses': 'startup',
  'runtime.staleSnapshot': 'startup',
  'runtime.stuckBoot': 'startup',
});

/** 兜底：用标题/详情里的关键字再判一次，覆盖 doctor:selfCheck 的旧 code */
function topicByText(text) {
  const s = String(text || '');
  if (ARM_RE.test(s)) return 'arm';
  if (ADB_RE.test(s)) return 'adb';
  if (SOUND_RE.test(s)) return 'sound';
  if (/INSTALL_FAILED|INSTALL_PARSE|签名|安装包|APK 损坏|échec d'installation|signature|paquet d'installation|APK corrompu|installation a échoué/i.test(s)) return 'install';
  if (/硬件加速|虚拟机监控程序|WHPX|AEHD|hypervisor|accel|accélération matérielle/i.test(s)) return 'accel';
  if (/attach failed|emu:0|旋转|嵌入|打不开|没反应|图标|ne s'ouvre pas|ne répond pas|fenêtre de rotation|icône|rotation/i.test(s)) return 'startup';
  if (/磁盘|空间|disk|共享目录|数据分区|disque|espace|dossier partagé|partition de données/i.test(s)) return 'storage';
  if (/网络|联网|DNS|下载源|réseau|connexion|source de téléchargement/i.test(s)) return 'network';
  return 'overview';
}

/** 自动检测问题 → 教程章节 */
function topicForIssue(issue) {
  if (!issue) return TOPICS.overview;
  const code = String(issue.code || '');
  let id = ISSUE_MAP[code];
  // 启动失败要看真实原因：ARM 翻译层崩溃有专属章节，不能一律甩给「打不开」
  if (!id || code === 'runtime.bootFailed' || code === 'logs.errors') {
    id = topicByText(`${issue.title || ''} ${issue.detail || ''}`);
    if (id === 'overview' && code === 'runtime.bootFailed') id = 'startup';
    if (id === 'overview' && code === 'logs.errors') id = 'other';
  }
  return TOPICS[id] || TOPICS.overview;
}

/** 安装/运行原始报错 → 教程章节 */
function topicForError(text) {
  const s = String(text || '');
  if (!s.trim()) return TOPICS.overview;
  if (ARM_RE.test(s)) return TOPICS.arm;
  if (ADB_RE.test(s)) return TOPICS.adb;
  if (SOUND_RE.test(s)) return TOPICS.sound;
  if (/INSTALL_|PARSE_FAILED|安装失败|签名|安装包|échec d'installation|installation a échoué|signature|paquet d'installation/.test(s)) return TOPICS.install;
  if (/attach failed|emu:0|device not found|旋转窗口|ne s'ouvre pas|ne répond pas/.test(s)) return TOPICS.startup;
  return topicByText(s) === 'overview' ? TOPICS.install : TOPICS[topicByText(s)];
}

/**
 * 统一入口：渲染层只传它手里有的东西（code / error / topic），
 * 主进程永远拿回一个受信任的章节锚点。
 */
function resolve(payload) {
  const p = typeof payload === 'string' ? { error: payload } : (payload || {});
  let topic = TOPICS.overview;
  if (p.topic && TOPICS[p.topic]) topic = TOPICS[p.topic];
  else if (p.issue || p.code) {
    const issue = typeof p.issue === 'string'
      ? { code: p.issue, title: p.title, detail: p.detail }
      : (p.issue || { code: p.code, title: p.title, detail: p.detail });
    topic = topicForIssue(issue);
  } else if (p.error || p.message || p.text) topic = topicForError(p.error || p.message || p.text);
  // 标题跟随界面语言；fr 缺译文时回退到 TOPICS 里的中文标题。
  const meta = anchors[topic.id];
  let title = topic.title;
  if (meta) {
    if (i18n.getLang() === 'fr') {
      if (meta.titleFr && String(meta.titleFr).trim()) title = meta.titleFr;
    } else if (meta.titleZh && String(meta.titleZh).trim()) {
      title = meta.titleZh;
    }
    // 法语标题来自 md 的章节标题，带「6.3 」这类编号；窗口标题里去掉更清爽。
    title = String(title).replace(/^\d+(?:\.\d+)*\s+/, '');
  }
  return {
    id: topic.id,
    anchor: topic.anchor,
    title,
    reason: String(p.reason || ''),
  };
}

module.exports = { TOPICS, ISSUE_MAP, topicForIssue, topicForError, topicByText, resolve };
