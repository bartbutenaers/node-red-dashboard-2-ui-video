module.exports = function (RED) {
    function UIVideoNode (config) {
        RED.nodes.createNode(this, config)

        const node = this

        node.config = config

        // which group are we rendering this widget
        const group = RED.nodes.getNode(config.group)

        const base = group.getBase()

        function validateValue(name, value, allowedValues) {
            if (allowedValues.includes(value)) {
                node.error(`Property msg.ui_update.${name} can only have values: ${allowedValues}`)
                return false
            } else {
                return true
            }
        }

        const beforeSend = async function (msg) {
            // dynamic properties
            const updates = msg.ui_update
            // Store all the dynamic properties, to make sure their values are still available at browser refresh
            if (updates) {
                if (typeof updates.url !== 'undefined') {
                    base.stores.state.set(group.getBase(), node, msg, 'url', updates.url)
                }
                if (typeof updates.autoplay !== 'undefined') {
                    base.stores.state.set(group.getBase(), node, msg, 'autoplay', updates.autoplay)
                }
                if (typeof updates.controls !== 'undefined') {
                    if (['show', 'hide'].includes(updates.controls)) {
                        base.stores.state.set(group.getBase(), node, msg, 'controls', updates.controls)
                    } else {
                        node.error('Property msg.ui_update.controls should be "show" or "hide"') 
                    }
                }
                if (typeof updates.sound !== 'undefined') {
                    if (['on', 'off'].includes(updates.sound)) {
                        base.stores.state.set(group.getBase(), node, msg, 'sound', updates.sound)
                    } else {
                        node.error('Property msg.ui_update.sound should be "on" or "off"')
                    }
                }
                if (typeof updates.readyPoster !== 'undefined') {
                    base.stores.state.set(group.getBase(), node, msg, 'readyPoster', updates.readyPoster)
                }
                if (typeof updates.errorPoster !== 'undefined') {
                    base.stores.state.set(group.getBase(), node, msg, 'errorPoster', updates.errorPoster)
                }
                if (typeof updates.unloadHiddenVideo !== 'undefined') {
                    if (['on', 'off'].includes(updates.unloadHiddenVideo)) {
                        base.stores.state.set(group.getBase(), node, msg, 'unloadHiddenVideo', updates.unloadHiddenVideo)
                    } else {
                        node.error('Property msg.ui_update.unloadHiddenVideo should be "on" or "off"')
                    }
                }
                if (typeof updates.intersectionThreshold !== 'undefined') {
                    if (typeof updates.intersectionThreshold === 'number' && updates.intersectionThreshold >= 0 && updates.intersectionThreshold <= 100) {
                        base.stores.state.set(group.getBase(), node, msg, 'intersectionThreshold', updates.intersectionThreshold)
                    } else {
                        node.error('Property msg.ui_update.intersectionThreshold should be a number between 0 and 100')
                    }
                }
                if (typeof updates.hlsLibrary !== 'undefined') {
                    if (['native', 'hlsjs'].includes(updates.hlsLibrary)) {
                        base.stores.state.set(group.getBase(), node, msg, 'hlsLibrary', updates.hlsLibrary)
                    } else {
                        node.error('Property msg.ui_update.hlsLibrary should be "native" or "hlsjs"')
                    }
                }
                if (typeof updates.logType !== 'undefined') {
                    if (['none', 'console', 'msg'].includes(updates.logType)) {
                        base.stores.state.set(group.getBase(), node, msg, 'logType', updates.logType)
                    } else {
                        node.error('Property msg.ui_update.logType should be "none", "console" or "msg"')
                    }
                }
                if (typeof updates.resizing !== 'undefined') {
                    if (['none', 'fit_longest', 'fit_shortest', 'fit_both'].includes(updates.resizing)) {
                        base.stores.state.set(group.getBase(), node, msg, 'resizing', updates.resizing)
                    } else {
                        node.error('Property msg.ui_update.resizing should be "none", "fit_longest", "fit_shortest" or "fit_both"')
                    }
                }
                if (typeof updates.hlsConfig !== 'undefined') {
                    if (typeof updates.hlsConfig === 'object') {
                        base.stores.state.set(group.getBase(), node, msg, 'hlsConfig', updates.hlsConfig)
                    } else {
                        node.error('Property msg.ui_update.hlsConfig should be an object')
                    }
                }
            }

            return msg
        }

        const evts = {
            onAction: true,
            beforeSend: beforeSend
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
