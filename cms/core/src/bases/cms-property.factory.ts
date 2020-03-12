import { Injectable, ComponentFactoryResolver, ViewContainerRef, ComponentRef, InjectionToken, Injector, Inject } from '@angular/core';
import { FormGroup } from '@angular/forms';

import { CMS } from '../cms';
import { PropertyMetadata } from '../decorators/property.decorator';
import { CmsProperty } from './cms-property';

// https://stackoverflow.com/questions/51824125/injection-of-multiple-instances-in-angular
export const PROPERTY_PROVIDERS_TOKEN: InjectionToken<CmsPropertyFactory[]> = new InjectionToken<CmsPropertyFactory[]>('PROPERTY_PROVIDERS_TOKEN');

export function getCmsPropertyFactory(propertyUIHint: string) {
    return (injector: Injector): CmsPropertyFactory => {
        return new CmsPropertyFactory(propertyUIHint, injector)
    };
};

@Injectable()
export class CmsPropertyFactory {
    protected propertyUIHint: string;
    protected componentFactoryResolver: ComponentFactoryResolver;
    protected injector: Injector;

    constructor(propertyUIHint: string, injector: Injector) {
        this.propertyUIHint = propertyUIHint;
        this.injector = injector;
        this.componentFactoryResolver = injector.get(ComponentFactoryResolver);
    }

    isMatching(propertyUIHint: string): boolean {
        return this.propertyUIHint == propertyUIHint;
    }

    createPropertyComponent(propertyName: string, propertyMetadata: PropertyMetadata, formGroup: FormGroup): ComponentRef<any> {
        return this.createDefaultCmsPropertyComponent(propertyName, propertyMetadata, formGroup);
    }

    protected createDefaultCmsPropertyComponent(propertyName: string, propertyMetadata: PropertyMetadata, formGroup: FormGroup): ComponentRef<any> {
        if (!CMS.PROPERTIES[propertyMetadata.displayType])
            throw new Error(`The CMS don't have the property with UIHint of ${propertyMetadata.displayType}`);

        const propertyFactory = this.componentFactoryResolver.resolveComponentFactory(CMS.PROPERTIES[propertyMetadata.displayType]);

        const propertyComponent = propertyFactory.create(this.injector);

        (<CmsProperty>propertyComponent.instance).label = propertyMetadata.displayName;
        (<CmsProperty>propertyComponent.instance).formGroup = formGroup;
        (<CmsProperty>propertyComponent.instance).propertyName = propertyName;

        return propertyComponent;
    }
}

@Injectable()
export class CmsPropertyFactoryResolver {
    constructor(@Inject(PROPERTY_PROVIDERS_TOKEN) private propertyFactories: CmsPropertyFactory[]) { }

    resolvePropertyFactory(uiHint: string): CmsPropertyFactory {
        const propertyFactory = this.propertyFactories.find(x => x.isMatching(uiHint));
        if (!propertyFactory)
            throw new Error(`The CMS can not resolve the Property Factor for the property with UIHint of ${uiHint}`);

        return propertyFactory;
    }
}