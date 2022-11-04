import { Entity } from "./entity";
import { Light } from "./light";
import { Vector } from "./vector";

export interface ILightEntity extends Partial<LightEntity> {
  light: Light;
  entity: Entity;
}

export class LightEntity {
  #light: Light;
  #entity: Entity;
  #element: HTMLElement;

  #distance = 0;
  #normalized = new Vector();

  #lightVersion = 0;
  #entityVersion = 0;
  #updates = {
    light: {
      position: 0,
    },
    entity: {
      position: 0,
      orientation: 0,
      size: 0,
    }
  };

  #red: HTMLElement;
  #green: HTMLElement;
  #blue: HTMLElement;

  public static create(input: ILightEntity): LightEntity {
    const lightEntity = new LightEntity();

    lightEntity.#entity = input.entity;
    lightEntity.#light = input.light;

    return lightEntity;
  }

  get #redFilter(): string {
    return this.#normalized.x < 0 ? '#reverse-red-filter' : '#red-filter';
  }
  get #greenFilter(): string {
    return -this.#normalized.y < 0 ? '#reverse-green-filter' : '#green-filter';
  }
  get #blueFilter() {
    return '#blue-filter';
  }

  get #redOpacity(): number {
    return clamp((this.#light.radius - this.#distance) / (this.#light.radius / 2), 0, 1) * Math.abs(this.#normalized.x);
    // return clamp(this.#light.radius - this.#distance, 0, 1) * Math.abs(this.#normalized.x);
  }
  get #greenOpacity(): number {
    return clamp((this.#light.radius - this.#distance) / (this.#light.radius / 2), 0, 1) * Math.abs(this.#normalized.y);
    // return clamp(this.#light.radius - this.#distance, 0, 1) * Math.abs(this.#normalized.y);
  }
  get #blueOpacity(): number {
    return clamp((this.#light.radius - this.#distance) / this.#light.radius, 0, 1);
    // return clamp((this.#light.radius - this.#distance) / this.#light.radius, 0.05, 1);
    // // return clamp(this.#light.radius - this.#distance, 0, 1);
  }

  public update(): void {
    const entity = this.#entity;
    if (entity.normalMap == null) {
      return;
    }

    if (this.#element == null) {
      this.#createElements();
    }

    if (this.#entityVersion !== entity.version || this.#lightVersion !== this.#light.version) {
      this.updateProperties();
    }
  }

  #createElements() {
    const entity = this.#entity;
    const light = this.#light;
    light.containerElement.insertAdjacentHTML('beforeend', `
      <div class="light-entity" style="
        display: inline-block;
        position: absolute;
        left: 0px;
        top: 0px;
        isolation: isolate;
        /* background-color: cyan; */
        /* mix-blend-mode: multiply; */
        width: ${entity.size.x}px; 
        height: ${entity.size.x}px;
      ">
        <div style="
          position: absolute;
          left: 0px;
          top: 0px;
          width: ${entity.size.x}px; 
          height: ${entity.size.x}px;
          mix-blend-mode: lighten;
          filter: url(${this.#redFilter}); 
          opacity: ${this.#redOpacity};
        ">
          <div style="
            position: absolute;
            left: 0px;
            top: 0px;
            width: ${entity.size.x}px; 
            height: ${entity.size.x}px;
            background-image: url(${entity.normalMap});
          "></div>
        </div>
        <div style="
            position: absolute;
            left: 0px;
            top: 0px;
            width: ${entity.size.x}px; 
            height: ${entity.size.x}px;
            mix-blend-mode: lighten;
            filter: url(${this.#greenFilter}); 
            opacity: ${this.#greenOpacity};
        ">
          <div style="
            position: absolute;
            left: 0px;
            top: 0px;
            width: ${entity.size.x}px; 
            height: ${entity.size.x}px;
            background-image: url(${entity.normalMap});
          "></div>
        </div>
        <div style="
            position: absolute;
            left: 0px;
            top: 0px;
            width: ${entity.size.x}px; 
            height: ${entity.size.x}px;
            mix-blend-mode: lighten;
            filter: url(${this.#blueFilter}); 
            opacity: ${this.#blueOpacity};
        ">
          <div style="
            position: absolute;
            left: 0px;
            top: 0px;
            width: ${entity.size.x}px; 
            height: ${entity.size.x}px;
            background-image: url(${entity.normalMap});
          "></div>
        </div>
      </div>`);
    this.#element = light.containerElement.lastElementChild as HTMLElement;
    [this.#red, this.#green, this.#blue] = Array.from(this.#element.children) as HTMLElement[];
  }

  private updateProperties(): void {
    const entity = this.#entity;
    const light = this.#light;

    if (this.#lightVersion === light.version && this.#entityVersion === entity.version) {
      return;
    }
    const lightUpdates = this.#updates.light;
    const entityUpdates = this.#updates.entity;

    let update;
    if (entityUpdates.size !== entity.updates.size) {
      update = 'size';
    } else if (lightUpdates.position !== light.updates.position || entityUpdates.position !== entity.updates.position) {
      update = 'position';
    } else if (entityUpdates.orientation !== entity.updates.orientation) {
      update = 'orientation';
    }

    this.#lightVersion = light.version;
    this.#entityVersion = entity.version;

    if (update == null) {
      return;
    }

    // console.log('Updating light entity:', update);
    const style = this.#element.style;

    switch (update) {
      case 'size':
        style.width = `${entity.size.x}px`;
        style.height = `${entity.size.y}px`;
      // Also update position if size changes
      // eslint-disable-next-line no-fallthrough
      case 'position':
        this.#distance = Math.round(light.position.subtract(entity.position).magnitude);
      // If only orientation changes, distance remains the same
      // eslint-disable-next-line no-fallthrough
      case 'orientation': {
        const redStyle = this.#red.style;
        const greenStyle = this.#green.style;
        const blueStyle = this.#blue.style;

        this.#normalized = light.position
          .subtract(entity.position).rotate(-entity.orientation, true)
          .normalize(true);

        style.translate = `${entity.left} ${entity.top}`;
        style.rotate = `${entity.orientation}deg`;
        redStyle.opacity = `${this.#redOpacity}`;
        greenStyle.opacity = `${this.#greenOpacity}`;
        blueStyle.opacity = `${this.#blueOpacity}`;
        redStyle.filter = `url(${this.#redFilter})`;
        greenStyle.filter = `url(${this.#greenFilter})`;
        blueStyle.filter = `url(${this.#blueFilter})`;
        break;
      }
    }
  }
}

function clamp(value, min, max): number {
  return Math.min(max, Math.max(min, value));
}

