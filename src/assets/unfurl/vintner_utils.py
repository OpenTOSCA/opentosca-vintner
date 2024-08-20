def get_operation(ctx, args):
    if args == None or len(args) != 2:
        raise AssertionError('Interface and operation name are required as inputs')

    interface = args[0]
    operation = args[1]

    operations = ctx.currentResource.template.get_interfaces()

    filtered = list(filter(lambda x: x.interfacename == interface and x.name == operation, operations))
    if len(filtered) != 1:
        return None

    return filtered[0].value.get('implementation')
