/**
 * カードデータ定義
 * GodField Clone
 */

// カードタイプ
const CardType = {
    WEAPON: 'weapon',
    ARMOR: 'armor',
    MIRACLE: 'miracle',
    ITEM: 'item',
    ACTION: 'action'
};

// 全カードデータ
const CARDS = [
    // ========== 武器 ==========
    {
        id: 'sword',
        name: '鋼の剣',
        type: CardType.WEAPON,
        icon: '🗡️',
        attack: 5,
        defense: 0,
        description: '標準的な剣。5ダメージを与える。',
        rarity: 'common',
        price: 50
    },
    {
        id: 'axe',
        name: '戦斧',
        type: CardType.WEAPON,
        icon: '🪓',
        attack: 7,
        defense: 0,
        description: '重い斧。7ダメージを与える。',
        rarity: 'common',
        price: 70
    },
    {
        id: 'spear',
        name: '槍',
        type: CardType.WEAPON,
        icon: '🔱',
        attack: 4,
        defense: 0,
        description: 'リーチの長い槍。4ダメージを与える。',
        rarity: 'common',
        price: 40
    },
    {
        id: 'dagger',
        name: '短剣',
        type: CardType.WEAPON,
        icon: '🔪',
        attack: 3,
        defense: 0,
        description: '素早い短剣。3ダメージを与える。',
        rarity: 'common'
    },
    {
        id: 'hammer',
        name: '戦槌',
        type: CardType.WEAPON,
        icon: '🔨',
        attack: 8,
        defense: 0,
        description: '重量級の槌。8ダメージを与える。',
        rarity: 'uncommon'
    },
    {
        id: 'bow',
        name: '弓',
        type: CardType.WEAPON,
        icon: '🏹',
        attack: 4,
        defense: 0,
        special: 'pierce',
        description: '遠距離攻撃。防御を1貫通する。',
        rarity: 'common'
    },
    {
        id: 'holy_sword',
        name: '聖剣',
        type: CardType.WEAPON,
        icon: '⚔️',
        attack: 10,
        defense: 0,
        description: '神聖な力を宿す剣。10ダメージを与える。',
        rarity: 'rare'
    },
    {
        id: 'cursed_blade',
        name: '呪いの刃',
        type: CardType.WEAPON,
        icon: '🗡️',
        attack: 12,
        defense: 0,
        selfDamage: 3,
        description: '12ダメージを与えるが、自分も3ダメージ。',
        rarity: 'rare'
    },
    {
        id: 'fire_staff',
        name: '炎の杖',
        type: CardType.WEAPON,
        icon: '🔥',
        attack: 6,
        defense: 0,
        special: 'burn',
        description: '6ダメージ+次ターン2追加ダメージ。',
        rarity: 'uncommon'
    },
    {
        id: 'ice_staff',
        name: '氷の杖',
        type: CardType.WEAPON,
        icon: '❄️',
        attack: 5,
        defense: 0,
        special: 'freeze',
        description: '5ダメージ+相手の次の攻撃力-2。',
        rarity: 'uncommon'
    },

    // ========== 防具 ==========
    {
        id: 'shield',
        name: '鉄の盾',
        type: CardType.ARMOR,
        icon: '🛡️',
        attack: 0,
        defense: 5,
        description: '5ダメージを軽減する。',
        rarity: 'common'
    },
    {
        id: 'helmet',
        name: '兜',
        type: CardType.ARMOR,
        icon: '⛑️',
        attack: 0,
        defense: 3,
        description: '3ダメージを軽減する。',
        rarity: 'common'
    },
    {
        id: 'armor',
        name: '鎧',
        type: CardType.ARMOR,
        icon: '🦺',
        attack: 0,
        defense: 7,
        description: '7ダメージを軽減する。',
        rarity: 'uncommon'
    },
    {
        id: 'magic_barrier',
        name: '魔法障壁',
        type: CardType.ARMOR,
        icon: '🔮',
        attack: 0,
        defense: 4,
        special: 'reflect',
        description: '4軽減+魔法ダメージを1反射。',
        rarity: 'uncommon'
    },
    {
        id: 'holy_shield',
        name: '聖なる盾',
        type: CardType.ARMOR,
        icon: '✨',
        attack: 0,
        defense: 10,
        description: '10ダメージを軽減する。',
        rarity: 'rare'
    },
    {
        id: 'counter_armor',
        name: '反撃の鎧',
        type: CardType.ARMOR,
        icon: '🛡️',
        attack: 0,
        defense: 3,
        special: 'counter',
        description: '3軽減+攻撃者に2ダメージ。',
        rarity: 'uncommon'
    },

    // ========== 奇跡 ==========
    {
        id: 'lightning',
        name: '雷撃',
        type: CardType.MIRACLE,
        icon: '⚡',
        attack: 8,
        defense: 0,
        mpCost: 4,
        special: 'unblockable',
        description: '8ダメージ（防御不可）[MP4]',
        rarity: 'rare'
    },
    {
        id: 'earthquake',
        name: '地震',
        type: CardType.MIRACLE,
        icon: '🌋',
        attack: 6,
        defense: 0,
        mpCost: 5,
        special: 'aoe',
        description: '全員に6ダメージ（自分含む）[MP5]',
        rarity: 'rare'
    },
    {
        id: 'divine_blessing',
        name: '神の祝福',
        type: CardType.MIRACLE,
        icon: '👼',
        attack: 0,
        defense: 0,
        mpCost: 3,
        heal: 15,
        description: 'HPを15回復する。[MP3]',
        rarity: 'rare'
    },
    {
        id: 'resurrection',
        name: '復活',
        type: CardType.MIRACLE,
        icon: '💫',
        attack: 0,
        defense: 0,
        mpCost: 8,
        special: 'revive',
        description: 'HP1で復活（1回のみ有効）[MP8]',
        rarity: 'legendary'
    },
    {
        id: 'time_stop',
        name: '時間停止',
        type: CardType.MIRACLE,
        icon: '⏱️',
        attack: 0,
        defense: 0,
        mpCost: 6,
        special: 'extra_turn',
        description: '追加ターンを得る。[MP6]',
        rarity: 'legendary'
    },

    // ========== アイテム ==========
    {
        id: 'potion',
        name: '回復薬',
        type: CardType.ITEM,
        icon: '🧪',
        attack: 0,
        defense: 0,
        heal: 8,
        description: 'HPを8回復する。',
        rarity: 'common'
    },
    {
        id: 'herb',
        name: '薬草',
        type: CardType.ITEM,
        icon: '🌿',
        attack: 0,
        defense: 0,
        heal: 5,
        description: 'HPを5回復する。',
        rarity: 'common'
    },
    {
        id: 'elixir',
        name: 'エリクサー',
        type: CardType.ITEM,
        icon: '✨',
        attack: 0,
        defense: 0,
        heal: 20,
        description: 'HPを20回復する。',
        rarity: 'rare'
    },
    {
        id: 'power_up',
        name: '力の薬',
        type: CardType.ITEM,
        icon: '💪',
        attack: 0,
        defense: 0,
        buff: { attack: 3 },
        description: '次の攻撃力+3',
        rarity: 'uncommon'
    },
    {
        id: 'defense_up',
        name: '守りの薬',
        type: CardType.ITEM,
        icon: '🛡️',
        attack: 0,
        defense: 0,
        buff: { defense: 3 },
        description: '次の防御力+3',
        rarity: 'uncommon'
    },
    {
        id: 'bomb',
        name: '爆弾',
        type: CardType.ITEM,
        icon: '💣',
        attack: 10,
        defense: 0,
        description: '10ダメージを与える。',
        rarity: 'uncommon'
    },
    {
        id: 'poison',
        name: '毒薬',
        type: CardType.ITEM,
        icon: '☠️',
        attack: 0,
        defense: 0,
        special: 'poison',
        poisonDamage: 3,
        poisonTurns: 3,
        description: '3ターンの間、毎ターン3ダメージ。',
        rarity: 'uncommon'
    },

    // ========== アクション ==========
    {
        id: 'dodge',
        name: '回避',
        type: CardType.ACTION,
        icon: '💨',
        attack: 0,
        defense: 0,
        mpCost: 2,
        special: 'dodge',
        description: '次の攻撃を完全回避。[MP2]',
        rarity: 'uncommon'
    },
    {
        id: 'counter',
        name: 'カウンター',
        type: CardType.ACTION,
        icon: '↩️',
        attack: 0,
        defense: 0,
        mpCost: 3,
        special: 'counter_attack',
        description: '受けたダメージをそのまま返す。[MP3]',
        rarity: 'rare'
    },
    {
        id: 'buy',
        name: '買い物',
        type: CardType.ACTION,
        icon: '🛒',
        attack: 0,
        defense: 0,
        mpCost: 0,
        special: 'buy',
        description: '相手のランダムなカードを購入できる。[無料]',
        rarity: 'rare',
        price: 0
    },
    {
        id: 'sell',
        name: '売りつけ',
        type: CardType.ACTION,
        icon: '💸',
        attack: 0,
        defense: 0,
        mpCost: 0,
        special: 'sell',
        description: '自分のカードを相手に売りつける。[無料]',
        rarity: 'rare',
        price: 0
    },
    {
        id: 'exchange',
        name: '両替',
        type: CardType.ACTION,
        icon: '💱',
        attack: 0,
        defense: 0,
        mpCost: 0,
        special: 'exchange',
        description: 'HP/MP/お金を自由に両替する。[無料]',
        rarity: 'uncommon',
        price: 0
    },
    {
        id: 'discard',
        name: '破棄',
        type: CardType.ACTION,
        icon: '🗑️',
        attack: 0,
        defense: 0,
        mpCost: 2,
        special: 'discard',
        description: '相手のカードを1枚捨てさせる。[MP2]',
        rarity: 'uncommon'
    },
    {
        id: 'draw',
        name: 'ドロー',
        type: CardType.ACTION,
        icon: '🃏',
        attack: 0,
        defense: 0,
        mpCost: 1,
        special: 'draw',
        drawCount: 2,
        description: 'カードを2枚引く。[MP1]',
        rarity: 'common'
    },
    {
        id: 'swap',
        name: '入れ替え',
        type: CardType.ACTION,
        icon: '🔄',
        attack: 0,
        defense: 0,
        mpCost: 5,
        special: 'swap_hp',
        description: '自分と相手のHPを入れ替える。[MP5]',
        rarity: 'legendary'
    }
];

// レア度に基づく出現率の重み
const RARITY_WEIGHTS = {
    common: 40,
    uncommon: 30,
    rare: 20,
    legendary: 10
};

/**
 * デッキを生成する
 * @param {number} deckSize デッキのサイズ
 * @returns {Array} シャッフルされたデッキ
 */
function generateDeck(deckSize = 40) {
    const deck = [];
    
    // カードタイプ別の出現比率（攻撃/防御を高く）
    const typeWeights = {
        [CardType.WEAPON]: 40,  // 攻撃カード 40%
        [CardType.ARMOR]: 30,   // 防御カード 30%
        [CardType.MIRACLE]: 10, // 奇跡カード 10%
        [CardType.ITEM]: 10,    // アイテムカード 10%
        [CardType.ACTION]: 10   // アクションカード 10%
    };
    
    while (deck.length < deckSize) {
        const card = getRandomCardByType(typeWeights);
        deck.push({ ...card, instanceId: `${card.id}_${Date.now()}_${Math.random()}` });
    }
    
    return shuffleArray(deck);
}

/**
 * カードの価格を自動計算
 * @param {Object} card カードデータ
 * @returns {number} 価格
 */
function calculateCardPrice(card) {
    // MP消費カードは無料
    if (card.mpCost && card.mpCost > 0) {
        return 0;
    }
    
    // 既に価格が設定されている場合はそれを使用
    if (card.price !== undefined) {
        return card.price;
    }
    
    let price = 0;
    
    // 攻撃力×8（初期お金30円に合わせて調整）
    if (card.attack) {
        price += card.attack * 8;
    }
    
    // 防御力×7
    if (card.defense) {
        price += card.defense * 7;
    }
    
    // 回復×4
    if (card.heal) {
        price += card.heal * 4;
    }
    
    // 特殊効果+15
    if (card.special) {
        price += 15;
    }
    
    // 最低価格5円
    return Math.max(price, 5);
}

/**
 * タイプに基づいてランダムなカードを取得
 * @param {Object} typeWeights タイプ別の重み
 * @returns {Object} カードデータ
 */
function getRandomCardByType(typeWeights) {
    const totalWeight = Object.values(typeWeights).reduce((a, b) => a + b, 0);
    let random = Math.random() * totalWeight;
    
    let selectedType = CardType.WEAPON;
    for (const [type, weight] of Object.entries(typeWeights)) {
        random -= weight;
        if (random <= 0) {
            selectedType = type;
            break;
        }
    }
    
    const cardsOfType = CARDS.filter(card => card.type === selectedType);
    const card = cardsOfType[Math.floor(Math.random() * cardsOfType.length)];
    
    // 価格を計算して追加
    return { ...card, price: calculateCardPrice(card) };
}

/**
 * レア度に基づいてランダムなカードを取得
 * @returns {Object} カードデータ
 */
function getRandomCardByRarity() {
    const totalWeight = Object.values(RARITY_WEIGHTS).reduce((a, b) => a + b, 0);
    let random = Math.random() * totalWeight;
    
    let selectedRarity = 'common';
    for (const [rarity, weight] of Object.entries(RARITY_WEIGHTS)) {
        random -= weight;
        if (random <= 0) {
            selectedRarity = rarity;
            break;
        }
    }
    
    const cardsOfRarity = CARDS.filter(card => card.rarity === selectedRarity);
    return cardsOfRarity[Math.floor(Math.random() * cardsOfRarity.length)];
}

/**
 * 配列をシャッフル
 * @param {Array} array 
 * @returns {Array}
 */
function shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

/**
 * カードIDからカードデータを取得
 * @param {string} cardId 
 * @returns {Object|null}
 */
function getCardById(cardId) {
    return CARDS.find(card => card.id === cardId) || null;
}

/**
 * タイプ別のカードアイコンを取得
 * @param {string} type 
 * @returns {string}
 */
function getTypeIcon(type) {
    const icons = {
        [CardType.WEAPON]: '⚔️',
        [CardType.ARMOR]: '🛡️',
        [CardType.MIRACLE]: '✨',
        [CardType.ITEM]: '💊',
        [CardType.ACTION]: '⚡'
    };
    return icons[type] || '❓';
}

// エクスポート
window.CardType = CardType;
window.CARDS = CARDS;
window.generateDeck = generateDeck;
window.getCardById = getCardById;
window.getTypeIcon = getTypeIcon;
window.shuffleArray = shuffleArray;

