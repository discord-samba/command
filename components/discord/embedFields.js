customElements.define('embed-fields', class extends HTMLElement
{
	connectedCallback()
	{
		if (!this.isConnected)
			return;

		discordEmbedFieldsTemplate.call(this);
	}
});

/** @this {HTMLElement} */
function discordEmbedFieldsTemplate()
{
	const shadow = this.attachShadow({ mode: 'open' });

	shadow.innerHTML = `
		<style>
			:host(.discord-embed-fields) {
				display: flex;
				flex-wrap: wrap;
				margin-top: 8px;
			}
		</style>
	`;

	this.classList.add('discord-embed-fields');

	// Assign self to the fields slot
	this.setAttribute('slot', 'fields');

	// <slot>
	const slot = document.createElement('slot');
	shadow.appendChild(slot);
	// </slot>
}
