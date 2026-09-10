# Chord Query

输入和弦名称，立刻在钢琴上看到指法。

这是对 2020 年 PyQt5 桌面版的现代化重制：同一套和弦查询能力，换成可在浏览器里打开的交互键盘、即时解析和试听。

## 功能

- 输入即查：`C`、`Dm7`、`F#maj7`、`Bb7`、`Csus4`、`Cadd9`、`C/E`
- 两八度钢琴高亮，斜杠和弦的低音用另一种颜色标出
- 组成音、音程与转位
- 点击琴键试听单音，回车播放柱式或分解和弦
- 兼容旧版写法：`#C`、`bD`、`CM7`、`dom7`

## 本地运行

需要 Node.js 18+。

```bash
npm install
npm run dev
```

打开 [http://localhost:3000](http://localhost:3000)。

```bash
npm test
npm run build
```

## 和弦引擎

解析逻辑在 `lib/chords.ts`，与界面分离，可用 `npm test` 单独验证。旧桌面程序里斜杠和弦会丢掉原位根音、九和弦切片也容易让人误读；新版会保留全部组成音，并按音程字母规则拼写（例如 `Cm` 为 C · E♭ · G）。

## 旧版

原始 Python / PyQt5 代码在 [`legacy/`](./legacy)。当时的环境是 Python 3.7 + PyQt5。
