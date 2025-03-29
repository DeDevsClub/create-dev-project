import React from 'react';

export default class ChartMixedSVG extends React.Component {
	render() {
		return (
			<svg className={this.props.className} viewBox="0 0 512 512">
				<path d="M507.8 37.24c6 6.54 5.5 16.65-1 22.6l-176 159.96c-6.4 5.8-16.1 5.6-22.1-.5L190.4 100.1 25.41 220.9c-7.15 5.2-17.152 3.7-22.349-3.5-5.198-7.1-3.617-17.1 3.529-22.3L182.6 67.06c5.5-4.63 15.1-3.94 20.7 1.63L320.5 185.9 485.2 36.16c6.6-5.94 16.7-5.46 22.6 1.08zM112 368v64c0 26.5-21.49 48-48 48s-48-21.5-48-48v-64c0-26.5 21.49-48.9 48-48.9s48 22.4 48 48.9zm-32 64v-64c0-8.8-7.16-16-16-16s-16 7.2-16 16v64c0 8.8 7.16 16 16 16s16-7.2 16-16zm64-160.9c0-25.6 21.5-48 48-48s48 22.4 48 48V432c0 26.5-21.5 48-48 48s-48-21.5-48-48V271.1zm48-16c-8.8 0-16 8.1-16 16V432c0 8.8 7.2 16 16 16s16-7.2 16-16V271.1c0-7.9-7.2-16-16-16zM368 336v96c0 26.5-21.5 48-48 48s-48-21.5-48-48v-96c0-26.5 21.5-48.9 48-48.9s48 22.4 48 48.9zm-32 96v-96c0-8.8-7.2-16.9-16-16.9s-16 8.1-16 16.9v96c0 8.8 7.2 16 16 16s16-7.2 16-16zm64-160.9c0-25.6 21.5-48 48-48s48 22.4 48 48V432c0 26.5-21.5 48-48 48s-48-21.5-48-48V271.1zm48-16c-8.8 0-16 8.1-16 16V432c0 8.8 7.2 16 16 16s16-7.2 16-16V271.1c0-7.9-7.2-16-16-16z" />
			</svg>
		);
	}
}
