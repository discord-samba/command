// Track reactions added
let reactionCount = [];

customElements.define('message-reaction', class extends HTMLElement
{
	get lightTheme()
	{
		return this.parentNode.parentNode.parentNode.hasAttribute('light');
	}

	static get observedAttributes()
	{
		return ['me'];
	}

	get me()
	{
		return this.hasAttribute('me');
	}

	set me(isMe)
	{
		if (isMe)
			return this.setAttribute('me', '');

		this.removeAttribute('me');
	}

	attributeChangedCallback(attr)
	{
		if (!this.isConnected)
			return;

		if (attr !== 'me')
			return;

		this.shadowRoot.lastChild.lastChild.lastChild.innerText = this.me
			? parseInt(this.count) + 1
			: this.count;
		
	}

	get image()
	{
		return this.getAttribute('image');
	}

	get count()
	{
		if (!this.hasAttribute('count'))
			return 1;

		return this.getAttribute('count');
	}

	connectedCallback()
	{
		if (!this.isConnected)
			return;

		this.parentID = this.parentElement.parentElement.messageID;
		this.reactionIndex = typeof reactionCount[this.parentID] === 'undefined'
			? reactionCount[this.parentID] = 1
			: reactionCount[this.parentID] += 1;

		if (this.reactionIndex > 20)
			return;

		this.onmouseup = e => this.me = e.which === 1
			? !this.me
			: this.me;

		discordMessageReactionTemplate.call(this);
	}
});

/** @this {HTMLElement} */
function discordMessageReactionTemplate()
{
	const shadow = this.attachShadow({ mode: 'open' });

	shadow.innerHTML = `
		<style>
			:host(.discord-message-reaction) {
				opacity: 1;
				transform: scale(1);
				max-height: 26px;
			}

			:host(.discord-message-reaction) .reaction {
				background-color: hsla(0, 0%, 100%, 0.06);
				border-radius: 3px;
				cursor: pointer;
				margin: 2px;
				transition: background-color .1s ease;
			}

			:host(.discord-light-theme) .reaction {
				background-color: rgba(6, 6, 7, 0.08);
			}

			.reaction .reaction-inner {
				user-select: none;
				padding: 0 6px;
				display: flex;
				max-height: 22px;
			}

			.reaction .reaction-inner .reaction-image {
				height: 1rem;
				width: 1rem;
				margin: 3px 0;
				min-width: auto;
				min-height: auto;
				object-fit: contain;
			}

			.reaction .reaction-inner .reaction-count {
				margin: 0 0 0 6px;
				padding-top: 1px;
				min-width: 9px;
				color: #72767d;
				font-size: 0.875rem;
				font-weight: 400;
				text-align: center;
			}

			:host(.discord-message-reaction[me]) .reaction {
				background-color: #47506d;
			}

			:host(.discord-message-reaction[me]) .reaction .reaction-inner .reaction-count {
				color: #7289da;
			}

			:host(.discord-light-theme):host(.discord-message-reaction[me]) .reaction {
				background-color: #d4dbf4;
			}

			:host(.discord-light-theme):host(.discord-message-reaction[me]) .reaction .reaction-inner .reaction-count {
				color: #7289da;
			}
		</style>
	`;

	this.classList.add('discord-message-reaction');

	if (this.lightTheme)
		this.classList.add('discord-light-theme');

	// <div class="reaction">
	const reactionDiv = document.createElement('div');
	{
		reactionDiv.classList.add('reaction');

		// <div class="reaction-inner">
		const reactionInnerDiv = document.createElement('div');
		{
			reactionInnerDiv.classList.add('reaction-inner');

			// <img src="this.image" class="reaction-image">
			const reactionImageimg = document.createElement('img');
			{
				reactionImageimg.classList.add('reaction-image');
				reactionImageimg.src = this.image;
			}
			reactionInnerDiv.appendChild(reactionImageimg);
			// </img>

			// <div class="reaction-count">
			const reactionCountDiv = document.createElement('div');
			{
				reactionCountDiv.classList.add('reaction-count');
				reactionCountDiv.innerText = this.count;
			}
			reactionInnerDiv.appendChild(reactionCountDiv);
			// </div>
		}
		reactionDiv.appendChild(reactionInnerDiv);
		// </div>
	}
	shadow.appendChild(reactionDiv);
	// </div>
}
