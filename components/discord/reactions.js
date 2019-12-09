customElements.define('message-reactions', class extends HTMLElement
{
	connectedCallback()
	{
		if (!this.isConnected)
			return;

		discordMessageReactionsTemplate.call(this);
	}
});

/** @this {HTMLElement} */
function discordMessageReactionsTemplate()
{
	const shadow = this.attachShadow({ mode: 'open' });

	shadow.innerHTML = `
		<style>
			:host-context(.discord-message):host(.discord-message-reactions) {
				display: flex;
				flex-wrap: wrap;
				flex-grow: 1;
				flex-shrink: 1;
				flex-basis: 0%;
				margin-top: 8px;
				margin-left: -2px;
			}
		</style>
	`;

	this.classList.add('discord-message-reactions');

	// Assign self to the reactions slot
	this.setAttribute('slot', 'reactions');

	// <slot>
	const slot = document.createElement('slot');
	shadow.appendChild(slot);
	// </slot>
}
