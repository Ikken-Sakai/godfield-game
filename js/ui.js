/**
 * UI操作
 * GodField Clone
 */

class GameUI {
    constructor() {
        this.game = new Game();
        this.elements = {};
        this.init();
    }

    init() {
        // DOM要素をキャッシュ
        this.elements = {
            // 画面
            titleScreen: document.getElementById('title-screen'),
            howToPlayScreen: document.getElementById('how-to-play-screen'),
            gameScreen: document.getElementById('game-screen'),
            
            // ボタン
            btnVsCpu: document.getElementById('btn-vs-cpu'),
            btnVsPlayer: document.getElementById('btn-vs-player'),
            btnHowToPlay: document.getElementById('btn-how-to-play'),
            btnBackToTitle: document.getElementById('btn-back-to-title'),
            btnUse: document.getElementById('btn-use'),
            btnEndTurn: document.getElementById('btn-end-turn'),
            btnRematch: document.getElementById('btn-rematch'),
            btnToTitle: document.getElementById('btn-to-title'),
            btnNoDefend: document.getElementById('btn-no-defend'),
            btnHome: document.getElementById('btn-home'),
            
            // プレイヤー情報
            playerName: document.getElementById('player-name'),
            playerHp: document.getElementById('player-hp'),
            playerHpFill: document.getElementById('player-hp-fill'),
            playerMp: document.getElementById('player-mp'),
            playerMpFill: document.getElementById('player-mp-fill'),
            playerMoney: document.getElementById('player-money'),
            playerHand: document.getElementById('player-hand'),
            playerWeapon: document.getElementById('player-weapon'),
            playerArmor: document.getElementById('player-armor'),
            
            // 相手情報
            opponentName: document.getElementById('opponent-name'),
            opponentHp: document.getElementById('opponent-hp'),
            opponentHpFill: document.getElementById('opponent-hp-fill'),
            opponentMp: document.getElementById('opponent-mp'),
            opponentMpFill: document.getElementById('opponent-mp-fill'),
            opponentMoney: document.getElementById('opponent-money'),
            opponentHand: document.getElementById('opponent-hand'),
            opponentWeapon: document.getElementById('opponent-weapon'),
            opponentArmor: document.getElementById('opponent-armor'),
            
            // フィールド
            turnText: document.getElementById('turn-text'),
            turnNumber: document.getElementById('turn-number'),
            fieldCards: document.getElementById('field-cards'),
            actionLog: document.getElementById('action-log'),
            
            // モーダル
            defenseModal: document.getElementById('defense-modal'),
            defenseOptions: document.getElementById('defense-options'),
            incomingAttack: document.getElementById('incoming-attack'),
            gameOverModal: document.getElementById('game-over-modal'),
            gameResult: document.getElementById('game-result'),
            gameResultDetail: document.getElementById('game-result-detail')
        };

        this.bindEvents();
    }

    bindEvents() {
        // タイトル画面
        this.elements.btnVsCpu.addEventListener('click', () => this.startGame('cpu'));
        this.elements.btnVsPlayer.addEventListener('click', () => this.startGame('pvp'));
        this.elements.btnHowToPlay.addEventListener('click', () => this.showScreen('how-to-play'));
        this.elements.btnBackToTitle.addEventListener('click', () => this.showScreen('title'));
        
        // ゲーム画面
        this.elements.btnUse.addEventListener('click', () => this.useSelectedCard());
        this.elements.btnEndTurn.addEventListener('click', () => this.endTurn());
        this.elements.btnNoDefend.addEventListener('click', () => this.skipDefense());
        
        // ゲーム終了
        this.elements.btnRematch.addEventListener('click', () => this.startGame(this.game.gameMode));
        this.elements.btnToTitle.addEventListener('click', () => this.showScreen('title'));
        this.elements.btnHome.addEventListener('click', () => {
            if (confirm('ゲームを終了してタイトルに戻りますか？')) {
                this.showScreen('title');
            }
        });
    }

    showScreen(screen) {
        // すべての画面を非表示
        this.elements.titleScreen.classList.remove('active');
        this.elements.howToPlayScreen.classList.remove('active');
        this.elements.gameScreen.classList.remove('active');
        
        // 指定された画面を表示
        switch (screen) {
            case 'title':
                this.elements.titleScreen.classList.add('active');
                break;
            case 'how-to-play':
                this.elements.howToPlayScreen.classList.add('active');
                break;
            case 'game':
                this.elements.gameScreen.classList.add('active');
                break;
        }
    }

    startGame(mode) {
        this.showScreen('game');
        
        // ゲーム初期化
        this.game.init(mode);
        
        // コールバック設定
        this.game.on('onLog', (message) => this.addLogEntry(message));
        this.game.on('onTurnChange', () => this.updateUI());
        this.game.on('onCpuAction', (card, result) => this.showCpuAction(card, result));
        this.game.on('onGameEnd', (result) => this.showGameOver(result));
        
        // モーダルを閉じる
        this.elements.defenseModal.classList.add('hidden');
        this.elements.gameOverModal.classList.add('hidden');
        
        // UI更新
        this.updateUI();
        this.clearActionLog();
        this.addLogEntry('ゲーム開始！');
    }

    updateUI() {
        const state = this.game.getState();
        if (!state) return;

        // プレイヤー情報
        this.updatePlayerInfo(state.player, 'player');
        this.updatePlayerInfo(state.opponent, 'opponent');
        
        // 手札
        this.renderHand(state.player.hand, this.elements.playerHand, true);
        this.renderHand(state.opponent.hand, this.elements.opponentHand, false);
        
        // ターン表示
        this.elements.turnText.textContent = this.game.isPlayerTurn ? 'あなたのターン' : 'CPUのターン';
        this.elements.turnNumber.textContent = `Turn ${state.turn}`;
        
        // ボタン状態
        this.updateButtons();
    }

    updatePlayerInfo(playerData, type) {
        const prefix = type === 'player' ? 'player' : 'opponent';
        
        // HP
        const hpElement = this.elements[`${prefix}Hp`];
        const hpFillElement = this.elements[`${prefix}HpFill`];
        
        hpElement.textContent = playerData.hp;
        // HP上限なし：現在値を基準に表示
        const hpPercent = Math.min((playerData.hp / 40) * 100, 100);
        hpFillElement.style.width = `${hpPercent}%`;
        
        // HP バーの色
        hpFillElement.classList.remove('low', 'critical');
        if (hpPercent <= 25) {
            hpFillElement.classList.add('critical');
        } else if (hpPercent <= 50) {
            hpFillElement.classList.add('low');
        }
        
        // MP
        const mpElement = this.elements[`${prefix}Mp`];
        const mpFillElement = this.elements[`${prefix}MpFill`];
        
        mpElement.textContent = playerData.mp;
        // MP上限なし：現在値を基準に表示
        const mpPercent = Math.min((playerData.mp / 10) * 100, 100);
        mpFillElement.style.width = `${mpPercent}%`;
        
        // お金
        const moneyElement = this.elements[`${prefix}Money`];
        moneyElement.textContent = playerData.money;
        
        // 装備
        const armorSlot = this.elements[`${prefix}Armor`];
        if (playerData.equipment.armor) {
            armorSlot.querySelector('.slot-label').textContent = playerData.equipment.armor.name;
        } else {
            armorSlot.querySelector('.slot-label').textContent = 'なし';
        }
    }

    renderHand(hand, container, faceUp) {
        container.innerHTML = '';
        
        hand.forEach((card, index) => {
            const cardElement = this.createCardElement(card, faceUp);
            cardElement.style.animationDelay = `${index * 0.05}s`;
            
            if (faceUp) {
                cardElement.addEventListener('click', () => this.selectCard(card, cardElement));
            }
            
            container.appendChild(cardElement);
        });
    }

    createCardElement(card, faceUp) {
        const div = document.createElement('div');
        div.className = `card ${faceUp ? 'face-up' : 'face-down'}`;
        div.dataset.instanceId = card.instanceId;
        
        if (faceUp) {
            div.classList.add(card.type);
            
            // MPコストまたは価格を表示
            const costLabel = card.mpCost > 0 
                ? `<span class="card-cost mp">MP${card.mpCost}</span>` 
                : `<span class="card-cost price">💰${card.price || 0}</span>`;
            
            div.innerHTML = `
                <div class="card-header">
                    <span class="card-type-icon">${getTypeIcon(card.type)}</span>
                    ${costLabel}
                </div>
                <div class="card-icon">${card.icon}</div>
                <div class="card-name">${card.name}</div>
                <div class="card-stats">
                    ${card.attack ? `<span class="stat attack">⚔️${card.attack}</span>` : ''}
                    ${card.defense ? `<span class="stat defense">🛡️${card.defense}</span>` : ''}
                    ${card.heal ? `<span class="stat heal">💚${card.heal}</span>` : ''}
                </div>
            `;
            
            // ツールチップ
            div.title = card.description;
        }
        
        return div;
    }

    selectCard(card, element) {
        if (!this.game.isPlayerTurn) return;
        
        // 選択状態をトグル
        const wasSelected = element.classList.contains('selected');
        
        // 全ての選択を解除
        this.elements.playerHand.querySelectorAll('.card').forEach(c => {
            c.classList.remove('selected');
        });
        
        if (!wasSelected) {
            element.classList.add('selected');
            this.game.selectedCard = card;
        } else {
            this.game.selectedCard = null;
        }
        
        this.updateButtons();
    }

    updateButtons() {
        const state = this.game.getState();
        const isPlayerTurn = this.game.isPlayerTurn;
        const hasSelectedCard = this.game.selectedCard !== null;
        
        // 使用ボタン：カードが選択されている場合に有効
        this.elements.btnUse.disabled = !isPlayerTurn || !hasSelectedCard;
        
        // 選択されたカードに応じてボタンテキストを変更
        if (hasSelectedCard) {
            const card = this.game.selectedCard;
            let btnText = '🎴 使用';
            if (card.type === CardType.WEAPON || card.attack > 0) {
                btnText = '⚔️ 攻撃';
            } else if (card.type === CardType.ARMOR) {
                btnText = '🛡️ 装備';
            } else if (card.type === CardType.ITEM) {
                btnText = '💊 使用';
            } else if (card.type === CardType.MIRACLE) {
                btnText = '✨ 発動';
            } else if (card.type === CardType.ACTION) {
                btnText = '⚡ 発動';
            }
            this.elements.btnUse.querySelector('span').textContent = btnText;
        } else {
            this.elements.btnUse.querySelector('span').textContent = '🎴 使用';
        }
        
        // パスボタン：攻撃手段がない場合のみ有効
        const hasAttackCard = state && state.player.hand.some(card => 
            card.type === CardType.WEAPON || 
            card.attack > 0 || 
            (card.type === CardType.MIRACLE && card.attack)
        );
        this.elements.btnEndTurn.disabled = !isPlayerTurn || hasAttackCard;
    }

    useSelectedCard() {
        if (!this.game.selectedCard) return;
        
        const card = this.game.selectedCard;
        const result = this.game.useCard(card.instanceId);
        
        if (result.success) {
            // アニメーション
            this.showCardPlay(card);
            
            // 防御フェーズが必要な場合
            if (result.needDefense) {
                this.game.selectedCard = null;
                this.updateUI();
                
                // 防御選択モーダルを表示
                setTimeout(() => {
                    this.showDefenseModal(result.damage);
                }, 500);
                return;
            }
            
            // ダメージエフェクト
            if (result.damage > 0) {
                this.showDamageEffect('opponent', result.damage);
            }
            if (result.heal > 0) {
                this.showHealEffect('player', result.heal);
            }
            
            // 1ターン1アクション制：カード使用後に自動ターン終了
            this.game.selectedCard = null;
            this.updateUI();
            
            // 少し待ってからターン終了（アニメーション確認用）
            setTimeout(() => {
                this.endTurn();
            }, 800);
        } else {
            this.game.selectedCard = null;
            this.updateUI();
        }
    }

    endTurn() {
        // パス時はカードを1枚ドロー
        this.game.drawCards('player', 1);
        this.addLogEntry('パス：カードを1枚ドロー');
        
        this.game.selectedCard = null;
        
        // 少し待ってからターン終了
        setTimeout(() => {
            this.game.endTurn();
            this.updateUI();
        }, 500);
    }

    showCardPlay(card) {
        // フィールドにカードを表示
        const cardElement = this.createCardElement(card, true);
        cardElement.classList.add('playing');
        this.elements.fieldCards.appendChild(cardElement);
        
        // 一定時間後に削除
        setTimeout(() => {
            cardElement.remove();
        }, 2000);
    }

    showCpuAction(card, result) {
        this.showCardPlay(card);
        
        if (result.damage > 0) {
            this.showDamageEffect('player', result.damage);
        }
        if (result.heal > 0) {
            this.showHealEffect('opponent', result.heal);
        }
        
        this.updateUI();
    }

    showDamageEffect(target, damage) {
        const element = target === 'player' 
            ? this.elements.playerHpFill.parentElement 
            : this.elements.opponentHpFill.parentElement;
        
        element.classList.add('damage-shake');
        setTimeout(() => element.classList.remove('damage-shake'), 300);
        
        // ダメージ数値表示
        this.showFloatingNumber(element, `-${damage}`, 'damage');
    }

    showHealEffect(target, heal) {
        const element = target === 'player'
            ? this.elements.playerHpFill.parentElement
            : this.elements.opponentHpFill.parentElement;
        
        element.classList.add('heal-glow');
        setTimeout(() => element.classList.remove('heal-glow'), 500);
        
        // 回復数値表示
        this.showFloatingNumber(element, `+${heal}`, 'heal');
    }

    showFloatingNumber(parent, text, type) {
        const div = document.createElement('div');
        div.className = `floating-number ${type}`;
        div.textContent = text;
        div.style.cssText = `
            position: absolute;
            font-size: 1.5rem;
            font-weight: bold;
            color: ${type === 'damage' ? '#ff4757' : '#2ed573'};
            text-shadow: 0 0 10px currentColor;
            animation: float-up 1s ease-out forwards;
            pointer-events: none;
            z-index: 100;
        `;
        
        parent.style.position = 'relative';
        parent.appendChild(div);
        
        setTimeout(() => div.remove(), 1000);
    }

    addLogEntry(message, type = '') {
        const entry = document.createElement('div');
        entry.className = `log-entry ${type}`;
        entry.textContent = message;
        
        this.elements.actionLog.appendChild(entry);
        this.elements.actionLog.scrollTop = this.elements.actionLog.scrollHeight;
        
        // 古いログを削除（最大20件）
        while (this.elements.actionLog.children.length > 20) {
            this.elements.actionLog.removeChild(this.elements.actionLog.firstChild);
        }
    }

    clearActionLog() {
        this.elements.actionLog.innerHTML = '';
    }

    showDefenseModal(incomingDamage) {
        const state = this.game.getState();
        const defenseCards = state.player.hand.filter(c => c.type === CardType.ARMOR);
        
        if (defenseCards.length === 0) {
            // 防御カードがない場合はスキップ
            this.skipDefense();
            return;
        }
        
        // 攻撃情報を表示
        this.elements.incomingAttack.textContent = `${incomingDamage}ダメージ`;
        
        // 防御カード選択肢を表示
        this.elements.defenseOptions.innerHTML = '';
        defenseCards.forEach(card => {
            const cardElement = this.createCardElement(card, true);
            cardElement.addEventListener('click', () => this.selectDefenseCard(card));
            this.elements.defenseOptions.appendChild(cardElement);
        });
        
        this.elements.defenseModal.classList.remove('hidden');
    }

    selectDefenseCard(card) {
        // 防御カードを使用
        const result = this.game.resolveAttack(card);
        
        this.elements.defenseModal.classList.add('hidden');
        
        if (result.success) {
            // ダメージエフェクト
            if (result.damage > 0) {
                this.showDamageEffect('player', result.damage);
            }
            
            this.updateUI();
            
            // 少し待ってからターン終了
            setTimeout(() => {
                this.endTurn();
            }, 800);
        }
    }

    skipDefense() {
        // 防御しない
        const result = this.game.resolveAttack(null);
        
        this.elements.defenseModal.classList.add('hidden');
        
        if (result.success) {
            // ダメージエフェクト
            if (result.damage > 0) {
                this.showDamageEffect('player', result.damage);
            }
            
            this.updateUI();
            
            // 少し待ってからターン終了
            setTimeout(() => {
                this.endTurn();
            }, 800);
        }
    }

    showGameOver(result) {
        this.elements.gameOverModal.classList.remove('hidden');
        
        const resultElement = this.elements.gameResult;
        const detailElement = this.elements.gameResultDetail;
        
        if (result === 'win') {
            resultElement.textContent = '🎉 勝利！';
            resultElement.className = 'win';
            detailElement.textContent = '見事な戦いでした！';
        } else {
            resultElement.textContent = '💀 敗北...';
            resultElement.className = 'lose';
            detailElement.textContent = '次は勝てるはず...';
        }
    }
}

// CSS アニメーション追加
const style = document.createElement('style');
style.textContent = `
    @keyframes float-up {
        0% { transform: translateY(0); opacity: 1; }
        100% { transform: translateY(-30px); opacity: 0; }
    }
`;
document.head.appendChild(style);

// ゲーム開始
document.addEventListener('DOMContentLoaded', () => {
    window.gameUI = new GameUI();
});

