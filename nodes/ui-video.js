module.exports = function (RED) {
    function UIVideoNode (config) {
        RED.nodes.createNode(this, config)

        const node = this

        node.config = config

        // which group are we rendering this widget
        const group = RED.nodes.getNode(config.group)

        const base = group.getBase()

        const beforeSend = async function (msg) {
            // dynamic properties
            const updates = msg.ui_update
            if (updates) {
                if (typeof updates.url !== 'undefined') {
                    base.stores.state.set(group.getBase(), node, msg, 'url', updates.url)
                }
                if (typeof updates.autoplay !== 'undefined') {
                    base.stores.state.set(group.getBase(), node, msg, 'autoplay', updates.autoplay)
                }
                if (typeof updates.controls !== 'undefined') {
// TODO check whether the value is 'show' or 'hide'
                    base.stores.state.set(group.getBase(), node, msg, 'controls', updates.controls)
                }
                if (typeof updates.sound !== 'undefined') {
// TODO check whether the value is 'on' or 'off'
                    base.stores.state.set(group.getBase(), node, msg, 'sound', updates.sound)
                }
                if (typeof updates.readyPoster !== 'undefined') {
                    base.stores.state.set(group.getBase(), node, msg, 'readyPoster', updates.readyPoster)
                }
                if (typeof updates.errorPoster !== 'undefined') {
                    base.stores.state.set(group.getBase(), node, msg, 'errorPoster', updates.errorPoster)
                }
            }

            return msg
        }

        const evts = {
            onAction: true,
            beforeSend
        }

        // inform the dashboard UI that we are adding this node
        if (group) {
            group.register(node, config, evts)
        } else {
            node.error('No group configured')
        }
    }

    RED.nodes.registerType('ui-video', UIVideoNode)
}
