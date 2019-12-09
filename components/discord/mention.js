customElements.define('discord-mention', class extends HTMLElement
{
	get char()
	{
		if (this.hasAttribute('channel'))
			return '#';

		return '@';
	}

	get roleColor()
	{
		if (this.hasAttribute('channel') || !this.hasAttribute('role-color'))
			return;

		return this.getAttribute('role-color');
	}

	connectedCallback()
	{
		if (!this.isConnected)
			return;


		discordMentionTemplate.call(this);
	}
});

/** @this {HTMLElement} */
function discordMentionTemplate()
{
	const shadow = this.attachShadow({ mode: 'open' });

	shadow.innerHTML = `
		<style>
			:host-context(.discord-message):host(.discord-mention) {
				color: #7289da;
				background-color: rgba(114, 137, 218, 0.1);
				font-weight: 500;
				padding: 0 1px;
				cursor: pointer;
			}

			:host-context(.discord-message):host(.discord-mention:hover) {
				color: #fff;
				background-color: rgba(114, 137, 218, 0.7);
			}

			:host-context(.discord-message[highlight]):host(.discord-mention:hover) {
				color: #7289da;
			}

			:host-context(.discord-message[highlight]):host(.discord-mention) {
				background-color: unset !important;
			}

			:host-context(.discord-message[highlight]):host(.discord-mention:hover) {
				text-decoration: underline;
			}
		</style>
	`;

	const colorRegex = /rgba?\((\d+), (\d+), (\d+)(?:, .+)\)/;

	/**
	 * @param {string} color
	 * @param {number} alpha
	 */
	function bgColor(color, alpha)
	{
		const colors = color.match(colorRegex);
		return `rgba(${colors[1]}, ${colors[2]}, ${colors[3]}, ${alpha})`;
	}

	this.classList.add('discord-mention');
	this.append(this.char);

	if (typeof this.roleColor !== 'undefined')
	{
		this.setAttribute('style', `color: ${this.roleColor}`);
		this.setAttribute(
			'style',
			`color: ${this.style.color}; background-color: ${bgColor(this.style.color, 0.1)}`
		);

		this.onmouseover = () =>
		{
			if (!this.parentElement.hasAttribute('highlight'))
				this.style.backgroundColor = bgColor(this.style.color, 0.3);
		};

		this.onmouseout = () =>
		{
			if (!this.parentElement.hasAttribute('highlight'))
				this.style.backgroundColor = bgColor(this.style.color, 0.1);
		};
	}

	// <slot>
	const slot = document.createElement('slot');
	shadow.appendChild(slot);
	// </slot>
}
