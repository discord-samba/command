customElements.define('discord-messages', class extends HTMLElement
{
	get isLightTheme()
	{
		return this.hasAttribute('light');
	}

	connectedCallback()
	{
		if (!this.isConnected)
			return;

		discordMessagesTemplate.call(this);
	}
});

/** @this {HTMLElement} */
function discordMessagesTemplate()
{
	const shadow = this.attachShadow({ mode: 'open' });

	shadow.innerHTML = `
		<style>
			:host(.discord-messages) {
				display: block;
				color: #fff;
				background-color: #36393e;
				font-size: 16px;
				padding: 2px 8px;
				line-height: 170%;
				border: 1px solid rgba(255, 255, 255, 0.05);
			}

			:host(.discord-light-theme):host(.discord-messages) {
				color: #747f8d;
				background-color: #f7f7f7;
				border-color: #dedede;
			}
		</style>
	`;

	this.classList.add('discord-messages');

	if (this.isLightTheme)
		this.classList.add('discord-light-theme');

	// <slot>
	const slot = document.createElement('slot');
	shadow.appendChild(slot);
	// </slot>
}