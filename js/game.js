/**
 * ゲームロジック
 * GodField Clone
 */

class Game {
    constructor() {
        this.state = null;
        this.isPlayerTurn = true;
        this.selectedCard = null;
        this.gameMode = 'cpu'; // 'cpu' or 'pvp'
        this.callbacks = {};
    }

    /**
     * ゲームを初期化
     * @param {string} mode ゲームモード
     */
    init(mode = 'cpu') {
        this.gameMode = mode;
        this.selectedCard = null;
        
        // デッキ生成
        const deck = generateDeck(60);
        
        // 初期状態
        this.state = {
            turn: 1,
            phase: 'main', // 'main', 'attack', 'defense', 'end'
            currentPlayer: 'player',
            deck: deck,
            discardPile: [],
            player: {
                name: 'あなた',
                hp: 40,
                mp: 10,
                money: 100,
                hand: [],
                equipment: { weapon: null, armor: null },
                buffs: [],
                status: [] // poison, burn, freeze など
            },
            opponent: {
                name: 'CPU',
                hp: 40,
                mp: 10,
                money: 100,
                hand: [],
                equipment: { weapon: null, armor: null },
                buffs: [],
                status: []
            },
            pendingAttack: null,
            log: []
        };

        // 初期手札を配る
        this.drawCards('player', 9);
        this.drawCards('opponent', 9);

        // 先攻後攻を決定
        this.isPlayerTurn = Math.random() < 0.5;
        this.state.currentPlayer = this.isPlayerTurn ? 'player' : 'opponent';
        
        this.addLog(`ゲーム開始！${this.isPlayerTurn ? 'あなた' : 'CPU'}の先攻です。`);

        // CPUが先攻の場合
        if (!this.isPlayerTurn) {
            setTimeout(() => this.cpuTurn(), 1500);
        }

        return this.state;
    }

    /**
     * カードをドロー
     */
    drawCards(target, count) {
        const targetPlayer = this.state[target];
        
        for (let i = 0; i < count; i++) {
            if (this.state.deck.length === 0) {
                // デッキが空の場合、捨て札をシャッフルして戻す
                if (this.state.discardPile.length > 0) {
                    this.state.deck = shuffleArray(this.state.discardPile);
                    this.state.discardPile = [];
                    this.addLog('デッキを再構築しました。');
                } else {
                    break;
                }
            }
            
            if (targetPlayer.hand.length < 9) {
                targetPlayer.hand.push(this.state.deck.pop());
            }
        }
        
        // カードを自動ソート
        this.sortHand(target);
    }

    /**
     * 手札をカードタイプ順にソート
     * 順序: 攻撃 → 防御 → 奇跡 → アイテム → アクション
     */
    sortHand(target) {
        const targetPlayer = this.state[target];
        const typeOrder = {
            [CardType.WEAPON]: 1,
            [CardType.ARMOR]: 2,
            [CardType.MIRACLE]: 3,
            [CardType.ITEM]: 4,
            [CardType.ACTION]: 5
        };
        
        targetPlayer.hand.sort((a, b) => {
            const orderA = typeOrder[a.type] || 99;
            const orderB = typeOrder[b.type] || 99;
            
            if (orderA !== orderB) {
                return orderA - orderB;
            }
            
            // 同じタイプの場合は攻撃力/防御力で降順ソート
            if (a.type === CardType.WEAPON) {
                return (b.attack || 0) - (a.attack || 0);
            } else if (a.type === CardType.ARMOR) {
                return (b.defense || 0) - (a.defense || 0);
            }
            
            return 0;
        });
    }

    /**
     * カードを使用
     */
    useCard(cardInstanceId, target = 'opponent') {
        const playerHand = this.state.player.hand;
        const cardIndex = playerHand.findIndex(c => c.instanceId === cardInstanceId);
        
        if (cardIndex === -1) return { success: false, message: 'カードが見つかりません' };
        
        const card = playerHand[cardIndex];
        
        // MPチェック
        if (card.mpCost && this.state.player.mp < card.mpCost) {
            return { success: false, message: 'MPが足りません！' };
        }
        
        let result = { success: true, message: '', damage: 0, heal: 0 };

        switch (card.type) {
            case CardType.WEAPON:
                result = this.handleWeaponCard(card, 'player', 'opponent');
                break;
            case CardType.ARMOR:
                // 防具は装備
                this.state.player.equipment.armor = card;
                result.message = `${card.name}を装備した！`;
                this.addLog(result.message);
                break;
            case CardType.ITEM:
                result = this.handleItemCard(card, 'player');
                break;
            case CardType.MIRACLE:
                result = this.handleMiracleCard(card, 'player', 'opponent');
                break;
            case CardType.ACTION:
                result = this.handleActionCard(card, 'player');
                break;
        }

        if (result.success) {
            // MP消費
            if (card.mpCost) {
                this.state.player.mp -= card.mpCost;
                this.addLog(`MP${card.mpCost}消費`);
            }
            
            // カードを手札から削除
            playerHand.splice(cardIndex, 1);
            this.state.discardPile.push(card);
            
            // カード補充条件
            // 1. MP消費カード（奇跡/アクション）を使用した場合、1枚ドロー
            // 2. 攻撃カードが0枚になった場合、3枚ドロー
            if (card.mpCost) {
                this.drawCards('player', 1);
                this.addLog('カードを1枚ドロー');
            } else {
                // 攻撃カード数をチェック
                const attackCardCount = playerHand.filter(c => 
                    c.type === CardType.WEAPON || (c.attack && c.attack > 0)
                ).length;
                
                if (attackCardCount === 0) {
                    this.drawCards('player', 3);
                    this.addLog('攻撃カードがなくなったので3枚ドロー！');
                }
            }
            
            // 勝敗チェック
            this.checkGameEnd();
        }

        return result;
    }

    /**
     * 武器カードの処理
     */
    handleWeaponCard(card, attacker, defender) {
        const attackerData = this.state[attacker];
        const defenderData = this.state[defender];
        
        let damage = card.attack;
        
        // バフ適用
        const attackBuff = attackerData.buffs.find(b => b.type === 'attack');
        if (attackBuff) {
            damage += attackBuff.value;
            attackerData.buffs = attackerData.buffs.filter(b => b.type !== 'attack');
        }

        // 攻撃情報を保存（防御フェーズで使用）
        this.state.pendingAttack = {
            attacker: attacker,
            defender: defender,
            card: card,
            damage: damage,
            originalDamage: damage
        };

        // 防御カードがある場合は防御フェーズへ
        const defenderHasArmor = defenderData.hand.some(c => c.type === CardType.ARMOR);
        if (defenderHasArmor && defender === 'player') {
            // プレイヤーが防御側の場合、防御選択を待つ
            return { success: true, needDefense: true, damage: damage };
        } else {
            // CPUまたは防御カードがない場合、そのまま処理
            return this.resolveAttack(null);
        }
    }

    /**
     * 攻撃を解決（防御後）
     */
    resolveAttack(defenseCard) {
        const attack = this.state.pendingAttack;
        if (!attack) return { success: false };

        const attackerData = this.state[attack.attacker];
        const defenderData = this.state[attack.defender];
        let damage = attack.damage;
        let blocked = 0;

        // 防御カード使用
        if (defenseCard) {
            blocked = Math.min(defenseCard.defense, damage);
            damage -= blocked;
            
            // 手札から削除（ドローなし）
            const cardIndex = defenderData.hand.findIndex(c => c.instanceId === defenseCard.instanceId);
            if (cardIndex !== -1) {
                defenderData.hand.splice(cardIndex, 1);
                this.state.discardPile.push(defenseCard);
            }
        }

        // 装備している防具もチェック
        if (defenderData.equipment.armor) {
            const armorBlock = Math.min(defenderData.equipment.armor.defense, damage);
            blocked += armorBlock;
            damage -= armorBlock;
            
            // 防具を消費（使い捨て）
            this.state.discardPile.push(defenderData.equipment.armor);
            defenderData.equipment.armor = null;
        }

        // ダメージ適用
        defenderData.hp = Math.max(0, defenderData.hp - damage);
        
        // 自傷ダメージ
        if (attack.card.selfDamage) {
            attackerData.hp = Math.max(0, attackerData.hp - attack.card.selfDamage);
            this.addLog(`${attack.card.name}の反動で${attack.card.selfDamage}ダメージ！`);
        }

        const defenderName = attack.defender === 'player' ? 'あなた' : 'CPU';
        let message = `${attack.card.name}で攻撃！`;
        if (blocked > 0) {
            message += ` ${blocked}ダメージを防御、`;
        }
        message += ` ${damage}ダメージ！`;
        
        this.addLog(message);

        // 攻撃情報をクリア
        this.state.pendingAttack = null;

        return { success: true, message, damage, blocked };
    }

    /**
     * アイテムカードの処理
     */
    handleItemCard(card, user) {
        const userData = this.state[user];
        let message = '';

        if (card.heal) {
            const healAmount = Math.min(card.heal, userData.maxHp - userData.hp);
            userData.hp += healAmount;
            message = `${card.name}を使用！HPが${healAmount}回復！`;
            this.addLog(message);
            return { success: true, message, heal: healAmount };
        }

        if (card.buff) {
            if (card.buff.attack) {
                userData.buffs.push({ type: 'attack', value: card.buff.attack });
                message = `${card.name}を使用！攻撃力+${card.buff.attack}！`;
            }
            if (card.buff.defense) {
                userData.buffs.push({ type: 'defense', value: card.buff.defense });
                message = `${card.name}を使用！防御力+${card.buff.defense}！`;
            }
            this.addLog(message);
            return { success: true, message };
        }

        if (card.attack) {
            // 爆弾など
            const target = user === 'player' ? 'opponent' : 'player';
            const targetData = this.state[target];
            targetData.hp = Math.max(0, targetData.hp - card.attack);
            message = `${card.name}を使用！${card.attack}ダメージ！`;
            this.addLog(message);
            return { success: true, message, damage: card.attack };
        }

        if (card.special === 'poison') {
            const target = user === 'player' ? 'opponent' : 'player';
            this.state[target].status.push({
                type: 'poison',
                damage: card.poisonDamage,
                turns: card.poisonTurns
            });
            message = `${card.name}を使用！相手を毒状態にした！`;
            this.addLog(message);
            return { success: true, message };
        }

        return { success: true, message: `${card.name}を使用した。` };
    }

    /**
     * 奇跡カードの処理
     */
    handleMiracleCard(card, user, target) {
        const userData = this.state[user];
        const targetData = this.state[target];
        let message = '';

        if (card.heal) {
            const healAmount = Math.min(card.heal, userData.maxHp - userData.hp);
            userData.hp += healAmount;
            message = `${card.name}！HPが${healAmount}回復！`;
            this.addLog(message);
            return { success: true, message, heal: healAmount };
        }

        if (card.attack) {
            let damage = card.attack;
            
            // 防御不可の場合は防具無視
            if (card.special !== 'unblockable' && targetData.equipment.armor) {
                const blocked = Math.min(targetData.equipment.armor.defense, damage);
                damage -= blocked;
                this.state.discardPile.push(targetData.equipment.armor);
                targetData.equipment.armor = null;
            }

            // AOEの場合は自分にもダメージ
            if (card.special === 'aoe') {
                userData.hp = Math.max(0, userData.hp - card.attack);
                this.addLog(`${card.name}！自分にも${card.attack}ダメージ！`);
            }

            targetData.hp = Math.max(0, targetData.hp - damage);
            message = `${card.name}！${damage}ダメージ！`;
            this.addLog(message);
            return { success: true, message, damage };
        }

        if (card.special === 'extra_turn') {
            // 追加ターン（次のターンもプレイヤー）
            this.state.extraTurn = true;
            message = `${card.name}！追加ターンを得た！`;
            this.addLog(message);
            return { success: true, message };
        }

        return { success: true, message: `${card.name}を発動した。` };
    }

    /**
     * アクションカードの処理
     */
    handleActionCard(card, user) {
        const userData = this.state[user];
        let message = '';

        if (card.special === 'draw') {
            this.drawCards(user, card.drawCount || 2);
            message = `${card.name}！カードを${card.drawCount || 2}枚引いた！`;
            this.addLog(message);
            return { success: true, message };
        }

        if (card.special === 'dodge') {
            userData.buffs.push({ type: 'dodge', turns: 1 });
            message = `${card.name}！次の攻撃を回避する！`;
            this.addLog(message);
            return { success: true, message };
        }

        if (card.special === 'counter_attack') {
            userData.buffs.push({ type: 'counter', turns: 1 });
            message = `${card.name}！カウンター態勢！`;
            this.addLog(message);
            return { success: true, message };
        }

        if (card.special === 'discard') {
            const target = user === 'player' ? 'opponent' : 'player';
            const targetHand = this.state[target].hand;
            if (targetHand.length > 0) {
                const discardIndex = Math.floor(Math.random() * targetHand.length);
                const discarded = targetHand.splice(discardIndex, 1)[0];
                this.state.discardPile.push(discarded);
                message = `${card.name}！相手の${discarded.name}を捨てさせた！`;
            } else {
                message = `${card.name}！しかし相手の手札は空だった。`;
            }
            this.addLog(message);
            return { success: true, message };
        }

        if (card.special === 'buy') {
            // 買い物カード：相手のランダムなカードを購入
            const target = user === 'player' ? 'opponent' : 'player';
            const targetHand = this.state[target].hand;
            if (targetHand.length > 0) {
                const buyIndex = Math.floor(Math.random() * targetHand.length);
                const targetCard = targetHand[buyIndex];
                const price = targetCard.price || 50;
                
                // 購入処理はUI側で確認モーダルを表示
                this.state.pendingPurchase = {
                    card: targetCard,
                    index: buyIndex,
                    price: price,
                    buyer: user,
                    seller: target
                };
                
                return { success: true, needPurchaseConfirm: true, card: targetCard, price: price };
            } else {
                message = `${card.name}！しかし相手はカードを持っていない。`;
                this.addLog(message);
                return { success: true, message };
            }
        }

        if (card.special === 'sell') {
            // 売りつけカード：自分のカードを相手に売る
            if (userData.hand.length > 1) {
                // 売るカード選択はUI側で処理
                this.state.pendingSale = {
                    seller: user,
                    buyer: user === 'player' ? 'opponent' : 'player'
                };
                
                return { success: true, needSellSelect: true };
            } else {
                message = `${card.name}！しかし売るカードがない。`;
                this.addLog(message);
                return { success: true, message };
            }
        }

        if (card.special === 'steal') {
            const target = user === 'player' ? 'opponent' : 'player';
            const targetHand = this.state[target].hand;
            if (targetHand.length > 0 && userData.hand.length < 9) {
                const stealIndex = Math.floor(Math.random() * targetHand.length);
                const stolen = targetHand.splice(stealIndex, 1)[0];
                userData.hand.push(stolen);
                message = `${card.name}！相手から${stolen.name}を奪った！`;
            } else {
                message = `${card.name}！しかし奪えなかった。`;
            }
            this.addLog(message);
            return { success: true, message };
        }

        if (card.special === 'swap_hp') {
            const target = user === 'player' ? 'opponent' : 'player';
            const temp = userData.hp;
            userData.hp = this.state[target].hp;
            this.state[target].hp = temp;
            message = `${card.name}！HPを入れ替えた！`;
            this.addLog(message);
            return { success: true, message };
        }

        return { success: true, message: `${card.name}を使用した。` };
    }

    /**
     * ターン終了
     */
    endTurn() {
        // ステータス効果の処理
        this.processStatusEffects(this.state.currentPlayer);
        
        // 追加ターンチェック
        if (this.state.extraTurn) {
            this.state.extraTurn = false;
            this.addLog('追加ターン！');
            return;
        }

        // ターン交代
        this.state.turn++;
        this.isPlayerTurn = !this.isPlayerTurn;
        this.state.currentPlayer = this.isPlayerTurn ? 'player' : 'opponent';
        
        // ターン開始時にMP回復（2ポイント）※上限なし
        const currentPlayerData = this.state[this.state.currentPlayer];
        currentPlayerData.mp += 2;
        
        this.addLog(`--- ターン ${this.state.turn} ---`);
        this.addLog(`${this.isPlayerTurn ? 'あなた' : 'CPU'}のターン`);

        // CPUのターン
        if (!this.isPlayerTurn && this.gameMode === 'cpu') {
            setTimeout(() => this.cpuTurn(), 1000);
        }
    }

    /**
     * ステータス効果の処理
     */
    processStatusEffects(target) {
        const targetData = this.state[target];
        const targetName = target === 'player' ? 'あなた' : 'CPU';
        
        // 毒ダメージ
        targetData.status = targetData.status.filter(status => {
            if (status.type === 'poison') {
                targetData.hp = Math.max(0, targetData.hp - status.damage);
                this.addLog(`${targetName}は毒で${status.damage}ダメージ！`);
                status.turns--;
                if (status.turns <= 0) {
                    this.addLog(`${targetName}の毒が消えた。`);
                    return false;
                }
            }
            return true;
        });

        // バフのターン減少
        targetData.buffs = targetData.buffs.filter(buff => {
            if (buff.turns !== undefined) {
                buff.turns--;
                return buff.turns > 0;
            }
            return true;
        });

        this.checkGameEnd();
    }

    /**
     * CPU のターン
     */
    cpuTurn() {
        if (this.isPlayerTurn || this.checkGameEnd()) return;

        const cpu = this.state.opponent;
        const player = this.state.player;

        // 簡易AI：HPが低い場合は回復優先、それ以外は攻撃
        let selectedCard = null;

        // HP が低い場合、回復カードを探す
        if (cpu.hp < 20) {
            selectedCard = cpu.hand.find(c => c.type === CardType.ITEM && c.heal);
            if (!selectedCard) {
                selectedCard = cpu.hand.find(c => c.type === CardType.MIRACLE && c.heal);
            }
        }

        // 攻撃カードを探す
        if (!selectedCard) {
            const weapons = cpu.hand.filter(c => c.type === CardType.WEAPON);
            if (weapons.length > 0) {
                // 一番攻撃力が高いものを選択
                selectedCard = weapons.reduce((a, b) => (a.attack > b.attack ? a : b));
            }
        }

        // アイテム（攻撃系）を探す
        if (!selectedCard) {
            selectedCard = cpu.hand.find(c => c.type === CardType.ITEM && c.attack);
        }

        // 奇跡（攻撃系）を探す
        if (!selectedCard) {
            selectedCard = cpu.hand.find(c => c.type === CardType.MIRACLE && c.attack);
        }

        // 何もなければランダム
        if (!selectedCard && cpu.hand.length > 0) {
            selectedCard = cpu.hand[Math.floor(Math.random() * cpu.hand.length)];
        }

        if (selectedCard) {
            const result = this.cpuUseCard(selectedCard);
            
            // UIコールバック
            if (this.callbacks.onCpuAction) {
                this.callbacks.onCpuAction(selectedCard, result);
            }
        }

        // ゲーム終了チェック
        if (!this.checkGameEnd()) {
            // ターン終了
            setTimeout(() => {
                this.endTurn();
                if (this.callbacks.onTurnChange) {
                    this.callbacks.onTurnChange();
                }
            }, 1500);
        }
    }

    /**
     * CPU がカードを使用
     */
    cpuUseCard(card) {
        const cpuHand = this.state.opponent.hand;
        const cardIndex = cpuHand.findIndex(c => c.instanceId === card.instanceId);
        
        if (cardIndex === -1) return { success: false };
        
        let result = { success: true };

        switch (card.type) {
            case CardType.WEAPON:
                result = this.handleWeaponCard(card, 'opponent', 'player');
                break;
            case CardType.ARMOR:
                this.state.opponent.equipment.armor = card;
                this.addLog(`CPUは${card.name}を装備した！`);
                break;
            case CardType.ITEM:
                result = this.handleItemCard(card, 'opponent');
                break;
            case CardType.MIRACLE:
                result = this.handleMiracleCard(card, 'opponent', 'player');
                break;
            case CardType.ACTION:
                result = this.handleActionCard(card, 'opponent');
                break;
        }

        // カードを手札から削除
        cpuHand.splice(cardIndex, 1);
        this.state.discardPile.push(card);
        
        // カード補充
        this.drawCards('opponent', 1);

        return result;
    }

    /**
     * ゲーム終了チェック
     */
    checkGameEnd() {
        if (this.state.player.hp <= 0) {
            this.state.phase = 'end';
            this.addLog('あなたは倒れた...');
            if (this.callbacks.onGameEnd) {
                this.callbacks.onGameEnd('lose');
            }
            return true;
        }
        
        if (this.state.opponent.hp <= 0) {
            this.state.phase = 'end';
            this.addLog('勝利！');
            if (this.callbacks.onGameEnd) {
                this.callbacks.onGameEnd('win');
            }
            return true;
        }
        
        return false;
    }

    /**
     * 購入を確定
     */
    confirmPurchase(accept) {
        if (!this.state.pendingPurchase) return { success: false };
        
        const { card, index, price, buyer, seller } = this.state.pendingPurchase;
        
        if (accept) {
            // 購入者のお金チェック
            if (this.state[buyer].money >= price) {
                // お金を移動
                this.state[buyer].money -= price;
                this.state[seller].money += price;
                
                // カードを移動
                const targetCard = this.state[seller].hand.splice(index, 1)[0];
                this.state[buyer].hand.push(targetCard);
                
                this.addLog(`${card.name}を${price}円で購入した！`);
                this.state.pendingPurchase = null;
                return { success: true, purchased: true };
            } else {
                this.addLog(`お金が足りない！（必要：${price}円）`);
                this.state.pendingPurchase = null;
                return { success: true, purchased: false };
            }
        } else {
            this.addLog('購入をキャンセルした。');
            this.state.pendingPurchase = null;
            return { success: true, purchased: false };
        }
    }

    /**
     * 売却を確定
     */
    confirmSell(cardInstanceId) {
        if (!this.state.pendingSale) return { success: false };
        
        const { seller, buyer } = this.state.pendingSale;
        const sellerData = this.state[seller];
        const buyerData = this.state[buyer];
        
        const cardIndex = sellerData.hand.findIndex(c => c.instanceId === cardInstanceId);
        if (cardIndex === -1) {
            this.state.pendingSale = null;
            return { success: false };
        }
        
        const card = sellerData.hand[cardIndex];
        const price = card.price || 50;
        
        // 相手がお金を持っているかチェック
        if (buyerData.money >= price) {
            // お金を移動
            buyerData.money -= price;
            sellerData.money += price;
            
            // カードを移動
            sellerData.hand.splice(cardIndex, 1);
            buyerData.hand.push(card);
            
            this.addLog(`${card.name}を${price}円で売りつけた！`);
        } else {
            this.addLog(`相手のお金が足りない！売却失敗。`);
        }
        
        this.state.pendingSale = null;
        return { success: true };
    }

    /**
     * ログを追加
     */
    addLog(message) {
        this.state.log.push({
            turn: this.state.turn,
            message,
            timestamp: Date.now()
        });
        
        if (this.callbacks.onLog) {
            this.callbacks.onLog(message);
        }
    }

    /**
     * コールバックを設定
     */
    on(event, callback) {
        this.callbacks[event] = callback;
    }

    /**
     * 現在の状態を取得
     */
    getState() {
        return this.state;
    }
}

// グローバルに公開
window.Game = Game;

