export function buildRoutePath(path){
    const routeParameterRegex = /:([a-zA-Z]+)/g
    const pathWIthParams = path.replaceAll(routeParameterRegex, '(?<$1>[a-z0-9\-_]+)');

    const pathRegex = new RegExp(`^${pathWIthParams}(?<query>\\?(.*))?$`);

    return pathRegex
}