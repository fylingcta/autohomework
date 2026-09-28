import type { CatalogNode, Worksheet } from './types.js';

export const worksheets: Worksheet[] = [{
  id: 'hy-g3-chinese-u1-a', title: '第一单元 · 校园里的新鲜事',
  subtitle: '三年级上册 · 统编语文 · 第一单元能力示范', minutes: 25,
  questions: [
    { id: 'q1', kind: 'fill', prompt: '看拼音写词语：zǎo chén。', points: 10, knowledge: '字词积累', accepted: ['早晨'], reference: '早晨', rubric: '完整写对得10分。' },
    { id: 'q2', kind: 'fill', prompt: '看拼音写词语：fú zhuāng。', points: 10, knowledge: '字词积累', accepted: ['服装'], reference: '服装', rubric: '完整写对得10分。' },
    { id: 'q3', kind: 'choice', prompt: '“放假了”中的“假”读什么？', points: 10, knowledge: '多音字', options: ['A. jiǎ', 'B. jià', 'C. jiā'], accepted: ['B'], reference: 'B，jià。表示假期时读四声。', rubric: '选B得10分。' },
    { id: 'q4', kind: 'choice', prompt: '哪一句把事物当作人来写，读起来更生动？', points: 10, knowledge: '有新鲜感的表达', options: ['A. 操场上有一棵树。', 'B. 今天我们一起读书。', 'C. 小草探出脑袋，向同学们问好。'], accepted: ['C'], reference: 'C。“探出脑袋”“问好”赋予小草人的动作。', rubric: '选C得10分。' },
    { id: 'q5', kind: 'choice', prompt: '遇到不理解的词语，下列哪一种做法不合适？', points: 10, knowledge: '理解词语的方法', options: ['A. 联系前后句理解。', 'B. 查字典并核对意思。', 'C. 不思考，直接抄别人的解释。'], accepted: ['C'], reference: 'C。理解词语要主动思考，可以联系上下文或查字典。', rubric: '选C得10分。' },
    { id: 'q6', kind: 'fill', prompt: '选字填空（只填一个字）：同学们穿着整齐的服（装／妆）来到学校。', points: 10, knowledge: '形近字辨析', accepted: ['装'], reference: '装。“服装”指衣服。', rubric: '填写“装”得10分。' },
    { id: 'q7', kind: 'short', prompt: '读句子：“校园里的小树伸展着手臂，在风中跳舞。”哪些词让你觉得有新鲜感？这样写有什么好处？', points: 20, knowledge: '阅读与表达', reference: '“伸展着手臂”“跳舞”把小树当作人来写，让小树在风中摇动的样子更生动。', rubric: '指出“伸展着手臂”或“跳舞”等表达得8分；说明把树当作人写得6分；说明生动形象或表现风中摇动的姿态得6分。意思相近即可，不要求术语。' },
    { id: 'q8', kind: 'short', prompt: '用三到五句话介绍一位同学，写出他（她）的一两个特点，最好配一个小例子。请用化名。', points: 20, knowledge: '习作：介绍人物', reference: '示例：我的同学小禾很热心。一次我忘带铅笔，她主动借给我一支。课间她还会帮大家整理图书。我们都喜欢和她做朋友。', rubric: '明确介绍人物得4分；写出一两个特点得6分；用具体小事支持特点得6分；语句基本通顺得4分。不因与示例不同而扣分；三至五句是建议，不机械扣分。' },
  ],
}];

export const catalog: CatalogNode[] = [{ id: 'hunan-hengyang', label: '湖南 · 衡阳', kind: 'region', children: [
  { id: 'grade-3', label: '小学三年级', kind: 'grade', children: [
    { id: 'chinese', label: '语文', kind: 'subject', children: [
      { id: 'chinese-g3-vol1', label: '统编版 · 上册', kind: 'book', children: [
        { id: 'chinese-g3-vol1-u1', label: '第一单元 · 校园生活', kind: 'unit', children: [
          { id: 'worksheet-u1-a', label: '单元能力练习（一）', kind: 'worksheet', worksheetId: 'hy-g3-chinese-u1-a' },
        ] },
      ] },
    ] },
  ] },
] }];
