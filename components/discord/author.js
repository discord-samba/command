customElements.define('author-info', class extends HTMLElement
{
	get lightTheme()
	{
		return this.parentNode.parentNode.parentNode.host.parentNode.hasAttribute('light');
	}

	get compact()
	{
		return this.parentNode.parentNode.parentNode.host.parentNode.hasAttribute('compact');
	}

	get bot()
	{
		return this.hasAttribute('bot');
	}

	get roleColor()
	{
		if (!this.hasAttribute('role-color'))
			return;

		return this.getAttribute('role-color');
	}

	connectedCallback()
	{
		if (!this.isConnected)
			return;

		discordAuthorTemplate.call(this);
	}
});

/** @this {HTMLElement} */
function discordAuthorTemplate()
{
	const shadow = this.attachShadow({ mode: 'open' });

	shadow.innerHTML = `
		<style>
			:host(.discord-author-info) {
				display: inline-flex;
				align-items: center;
				font-size: 15px;
			}

			:host(.discord-author-info) .discord-author-username {
				font-size: 14.4px;
				font-weight: 400;
				letter-spacing: 0.5px;
				cursor: pointer;
			}

			:host(.discord-author-info) .discord-author-username:hover {
				text-decoration: underline;
			}

			:host(.discord-light-theme):host(.discord-author-info) .discord-author-username {
				color: #060607;
				font-weight: 500;
			}

			:host(.discord-author-info) .discord-bot-tag {
				background-color: #7289da;
				font-size: 0.65em;
				margin-left: 5px;
				padding-top: 3px;
				padding-bottom: 2px;
				padding-left: 0.275rem;
				padding-right: 0.275rem;
				border-radius: 3px;
				line-height: 100%;
				text-transform: uppercase;
				font-size: 10px;
				color: #fff;
			}

			:host(.discord-compact-mode):host(.discord-author-info) {
				display: inline-flex;
				flex-direction: row-reverse;
			}

			:host(.discord-compact-mode):host(.discord-author-info) .discord-author-username {
				margin-left: 4px;
				margin-right: 4px;
			}

			:host(.discord-compact-mode):host(.discord-author-info) .discord-bot-tag {
				margin-left: 4px;
				margin-right: 0;
			}
		</style>
	`;

	this.classList.add('discord-author-info');

	if (this.lightTheme)
		this.classList.add('discord-light-theme');

	if (this.compact)
		this.classList.add('discord-compact-mode');
		
	// <span class="discord-author-username">
	const usernameSpan = document.createElement('span')
	{
		usernameSpan.classList.add('discord-author-username');

		if (typeof this.roleColor !== 'undefined');
			usernameSpan.setAttribute('style', `color: ${this.roleColor}`);

		// <slot>
		const slot = document.createElement('slot');
		usernameSpan.appendChild(slot);
		// </slot>
	}
	shadow.appendChild(usernameSpan);
	// </span>

	// Add bot tag if author is marked as bot
	if (this.bot)
	{
		// <span class="discord-bot-tag">
		const botSpan = document.createElement('span');
		{
			botSpan.classList.add('discord-bot-tag');
			botSpan.innerText = 'Bot'
		}
		shadow.appendChild(botSpan);
		// </span>
	}
}
